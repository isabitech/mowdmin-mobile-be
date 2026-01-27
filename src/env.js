import { config } from "dotenv";
import fs from "fs";
import path from "path";

const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "..", ".env"),
];

const envPath = candidates.find((p) => fs.existsSync(p));

if (envPath) {
    config({ path: envPath });
    if (process.env.NODE_ENV !== "test") {
        console.log("🔧 Environment configuration loaded from:", envPath);
    }
} else {
    if (process.env.NODE_ENV !== "test") {
        console.log("ℹ️ No .env file found. Using platform environment variables.");
    }
}

const dbConnection = (process.env.DB_CONNECTION || "").toLowerCase();

const requiredBase = ["JWT_SECRET"];
const requiredMongo = ["MONGO_URI"]; // MONGO_DB_NAME is optional (Mongoose can infer)
const requiredSql = ["DB_HOST", "DB_DATABASE", "DB_USERNAME", "DB_PASSWORD"];
const requiredRedis = ["REDIS_HOST", "REDIS_PASSWORD"]; // OTP/blacklist features rely on Redis

let requiredVars = [...requiredBase, ...requiredRedis];
if (dbConnection === "mongodb") requiredVars = [...requiredVars, ...requiredMongo];
if (dbConnection === "mysql" || dbConnection === "postgres" || dbConnection === "postgresql") {
    requiredVars = [...requiredVars, ...requiredSql];
}

// Warn about missing env vars in non-production. In production, keep logs quiet.
if (process.env.NODE_ENV !== "production") {
    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            console.warn(`⚠️ Environment variable ${varName} is not set`);
        }
    }
}

export default process.env;