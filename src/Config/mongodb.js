import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

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
        } else {
            console.error('❌ An unknown error occurred while connecting to MongoDB.');
        }
        process.exit(1);
    }
};

export default mongoose;
