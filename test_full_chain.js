import "./src/env.js";
import mongoose from 'mongoose';
import { connectMongoDB } from './src/Config/mongodb.js';
import OrderService from './src/Services/OrderService.js';
import UserMongoModel from './src/MongoModels/UserMongoModel.js';
import OrderMongoModel from './src/MongoModels/OrderMongoModel.js';

async function testChain() {
    try {
        await connectMongoDB();
        console.log("Connected to MongoDB.");

        // Find a user who has orders
        const orders = await OrderMongoModel.find().limit(1);
        if (orders.length === 0) {
            console.log("No orders found in DB to test with.");
            process.exit(0);
        }

        const testUserId = orders[0].userId;
        console.log("Testing with userId:", testUserId, "Type:", typeof testUserId);

        // Simulate OrderService call
        const results = await OrderService.getOrdersByUser(testUserId.toString());
        console.log("Results from OrderService:", results.length);
        if (results.length > 0) {
            console.log("First result:", JSON.stringify(results[0], null, 2));
        } else {
            console.log("Got empty array from OrderService.");

            // Try direct repository call
            import { OrderRepository } from './src/repositories/OrderRepository.js';
            const directRepoResults = await OrderRepository.findAllByUserId(testUserId.toString());
            console.log("Results from direct Repository call:", directRepoResults.length);
        }

        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

testChain();
