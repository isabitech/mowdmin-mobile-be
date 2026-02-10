
import mongoose from 'mongoose';
import PrayerService from './src/Services/PrayerService.js';
import dotenv from 'dotenv';

dotenv.config();

const runVerification = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');

        // user ID to simulate
        // We'll trust there is at least one user or we will mock one if finding one fails contextually, 
        // but for now let's try to find a user or just use a random ID if we are just testing the repository/service logic
        // However, to test effectively we need real data or we create it.

        // better approach: Create a dummy user ID and a dummy prayer
        const userId = new mongoose.Types.ObjectId();
        const prayerData = {
            userId: userId,
            title: 'Verification Prayer',
            description: 'Testing isLiked field',
            isPublic: true,
            images: [],
        };

        console.log('Creating prayer...');
        const prayer = await PrayerService.createPrayer(prayerData);
        console.log('Prayer created:', prayer._id);

        console.log('Fetching all prayers (should have isLiked: false)...');
        let prayers = await PrayerService.getAll(userId.toString());
        const myPrayer = prayers.find(p => p._id.toString() === prayer._id.toString());
        console.log('Is liked?', myPrayer.isLiked);

        if (myPrayer.isLiked !== false) throw new Error('Expected isLiked to be false');

        console.log('Liking prayer...');
        await PrayerService.likePrayer(prayer._id, userId.toString());

        console.log('Fetching all prayers (should have isLiked: true)...');
        prayers = await PrayerService.getAll(userId.toString());
        const myLikedPrayer = prayers.find(p => p._id.toString() === prayer._id.toString());
        console.log('Is liked?', myLikedPrayer.isLiked);

        if (myLikedPrayer.isLiked !== true) throw new Error('Expected isLiked to be true');

        console.log('Unliking prayer...');
        await PrayerService.unlikePrayer(prayer._id, userId.toString());

        console.log('Fetching all prayers (should have isLiked: false)...');
        prayers = await PrayerService.getAll(userId.toString());
        const myUnlikedPrayer = prayers.find(p => p._id.toString() === prayer._id.toString());
        console.log('Is liked?', myUnlikedPrayer.isLiked);

        if (myUnlikedPrayer.isLiked !== false) throw new Error('Expected isLiked to be false');

        // Clean up
        console.log('Cleaning up...');
        await PrayerService.delete(prayer._id);
        console.log('Verification successful!');

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runVerification();
