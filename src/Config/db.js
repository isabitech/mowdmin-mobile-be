// Load environment configuration first
import "../env.js";
import { Sequelize } from "sequelize";

let sequelize = null;

// Create sequelize instance only when needed and after env vars are loaded
function getSequelize() {
  if (!sequelize) {
    console.log("🔧 Creating Sequelize instance");
    // Removed credential logging for security

    sequelize = new Sequelize({
      dialect: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: {
        max: process.env.NODE_ENV === "production" ? 20 : 5,
        min: 2,
        acquire: 30000,
        idle: 10000,
      },
      logging: process.env.NODE_ENV === "development" ? console.log : false,
    });
  }
  return sequelize;
}

export const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to database...");
    const seq = getSequelize();

    await seq.authenticate();
    console.log("✅ Database connection established successfully.");

    // Setup model associations after all models are loaded
    try {
      const setupAssociations = await import("../Models/associations.js");
      setupAssociations.default();
    } catch (error) {
      console.warn("⚠️ Could not load associations:", error.message);
    }

    const disableSync =
      String(process.env.DISABLE_DB_SYNC).toLowerCase() === "true";
    if (process.env.NODE_ENV === "development" && !disableSync) {
      await seq.sync({ alter: true });
      console.log("✅ Database synced successfully.");
    } else if (process.env.NODE_ENV === "development" && disableSync) {
      console.log("ℹ️ Database sync skipped because DISABLE_DB_SYNC=true");
    }
  } catch (error) {
    console.error("❌ Unable to connect to the database:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

// Export a getter function instead of the instance directly
export default function getSequelizeInstance() {
  return getSequelize();
}
