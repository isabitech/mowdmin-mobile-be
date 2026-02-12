import mongoose from 'mongoose';
import '../env.js';
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mowdmin';

export const connectMongoDB = async () => {
    console.log(`mongo url->`, mongoUri)
    try {
        // await mongoose.connect(mongoUri);
        mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DB_NAME,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ MongoDB connection established successfully.');
    } catch (error) {
        console.log(`these is mongo error`, error)
        if (error instanceof Error) {
            console.error('❌ Unable to connect to MongoDB:', error.message);
            console.warn('⚠️  App will continue without MongoDB. Some features may not work.');
        } else {
            console.error('❌ An unknown error occurred while connecting to MongoDB.');
        }
        // Don't exit - allow app to continue running
        process.exit(1);
    }
};

export default mongoose;
