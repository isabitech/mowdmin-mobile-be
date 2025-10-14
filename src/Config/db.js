import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE || "mowdmin",
  process.env.DB_USERNAME || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_CONNECTION || "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("✅ Database synced successfully.");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Unable to connect to the database:", error.message);
    } else {
      console.error(
        "❌ An unknown error occurred while connecting to the database."
      );
    }
    process.exit(1);
  }
};

export default sequelize;
