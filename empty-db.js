// Wipes all data from the configured database (keeps schema/collections).
// Usage:
//   npm run empty-db -- --yes
//   FORCE_EMPTY_DB=1 npm run empty-db
//
// Safety:
// - Refuses to run in production unless FORCE_EMPTY_DB=1 (or --force).

import "./src/env.js";

const args = new Set(process.argv.slice(2));
const confirmed = args.has("--yes") || args.has("-y") || process.env.FORCE_EMPTY_DB === "1" || process.env.FORCE_EMPTY_DB === "true";
const force = args.has("--force") || args.has("--i-know-what-im-doing") || process.env.FORCE_EMPTY_DB === "1" || process.env.FORCE_EMPTY_DB === "true";

if (!confirmed) {
  console.error("Refusing to run: confirmation required. Re-run with --yes or set FORCE_EMPTY_DB=1.");
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && !force) {
  console.error("Refusing to run in production without FORCE_EMPTY_DB=1.");
  process.exit(1);
}

const dbConnection = (process.env.DB_CONNECTION || "").toLowerCase();

const wipeMongo = async () => {
  const { connectMongoDB } = await import("./src/Config/mongodb.js");
  const mongooseModule = await import("./src/Config/mongodb.js");
  const mongoose = mongooseModule.default;

  await connectMongoDB();

  const db = mongoose.connection.db;
  if (!db) throw new Error("Mongo connection has no db handle");

  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    // Keep collection + indexes; remove documents only
    await db.collection(c.name).deleteMany({});
  }

  await mongoose.disconnect();
  console.log(`✅ Emptied ${collections.length} MongoDB collections`);
};

const quoteIdent = (s) => `"${String(s).replaceAll('"', '""')}"`;

const wipeSql = async () => {
  const dbModule = await import("./src/Config/db.js");
  const getSequelizeInstance = dbModule.default;

  const sequelize = getSequelizeInstance();
  await sequelize.authenticate();

  const qi = sequelize.getQueryInterface();
  const tables = await qi.showAllTables();

  const tableIdents = (tables || [])
    .map((t) => {
      if (typeof t === "string") return quoteIdent(t);
      const tableName = t?.tableName ?? t?.name;
      const schema = t?.schema;
      if (schema && tableName) return `${quoteIdent(schema)}.${quoteIdent(tableName)}`;
      if (tableName) return quoteIdent(tableName);
      return null;
    })
    .filter(Boolean);

  if (tableIdents.length === 0) {
    console.log("✅ No tables found to truncate");
    await sequelize.close();
    return;
  }

  // Postgres supports RESTART IDENTITY + CASCADE.
  await sequelize.transaction(async (transaction) => {
    await sequelize.query(
      `TRUNCATE TABLE ${tableIdents.join(", ")} RESTART IDENTITY CASCADE;`,
      { transaction }
    );
  });

  await sequelize.close();
  console.log(`✅ Truncated ${tableIdents.length} SQL tables`);
};

try {
  if (dbConnection === "mongodb") {
    await wipeMongo();
  } else if (dbConnection === "mysql" || dbConnection === "postgres" || dbConnection === "postgresql") {
    await wipeSql();
  } else {
    throw new Error(`Unsupported DB_CONNECTION: ${process.env.DB_CONNECTION}`);
  }
} catch (err) {
  console.error("❌ Empty DB failed:", err?.message || err);
  process.exit(1);
}
