import "./src/env.js";
import mongoose from 'mongoose';
import { connectMongoDB } from './src/Config/mongodb.js';
import OrderMongoModel from './src/MongoModels/OrderMongoModel.js';
import UserMongoModel from './src/MongoModels/UserMongoModel.js';

async function diagnose() {
    try {
        await connectMongoDB();
        console.log("Connected to MongoDB.");

        // Check User IDs
        const users = await UserMongoModel.find().limit(5);
        console.log("--- Sample Users ---");
        users.forEach(u => console.log(`User ID: ${u._id}, Type: ${u._id.constructor.name}, Email: ${u.email}`));

        // Check Order IDs
        const orders = await OrderMongoModel.find().limit(5).sort({ createdAt: -1 });
        console.log("--- Latest Orders ---");
        orders.forEach(o => {
            console.log(`Order ID: ${o._id}, userId: ${o.userId}, userId Type: ${o.userId ? o.userId.constructor.name : 'null'}, createdAt: ${o.createdAt}`);
        });

        if (users.length > 0) {
            const firstUserId = users[0]._id;
            const matchCount = await OrderMongoModel.countDocuments({ userId: firstUserId });
            console.log(`--- Test Match ---`);
            console.log(`Searching orders for user: ${firstUserId}`);
            console.log(`Matches found: ${matchCount}`);

            // Try string match
            const stringMatchCount = await OrderMongoModel.countDocuments({ userId: firstUserId.toString() });
            console.log(`Matches found (as string): ${stringMatchCount}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Diagnosis failed:", error);
        process.exit(1);
    }
}

diagnose();
