import mongoose from 'mongoose';
import '../env.js';
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mowdmin';

export const connectMongoDB = async () => {
    // Connection URI logged without credentials
    console.log('Connecting to MongoDB...');
    try {
        await mongoose.connect(mongoUri, {
            dbName: process.env.MONGO_DB_NAME,
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE) || 20,
            minPoolSize: 2,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connection established successfully.');
    } catch (error) {
        console.error(`❌ MongoDB connection error:`, error);
        // Rethrow or exit as per existing logic, but index.js catches it or process on unhandled
        throw error;
    }
};

export default mongoose;
