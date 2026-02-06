import mongoose from 'mongoose';
import '../env.js';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mowdmin';

export const connectMongoDB = async () => {
    try {
        await mongoose.connect(mongoUri, {
            dbName: process.env.MONGO_DB_NAME,
        });
        console.log('✅ MongoDB connection established successfully.');
    } catch (error) {
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
