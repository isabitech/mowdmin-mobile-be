import "./src/env.js";
import { connectMongoDB } from "./src/Config/mongodb.js";

const checkProductIndexes = async () => {
    try {
        console.log("🔍 Checking Product collection indexes...");
        
        await connectMongoDB();
        const db = (await import('mongoose')).default.connection.db;
        const collection = db.collection('products');
        
        // Get all indexes
        const indexes = await collection.indexes();
        console.log("📋 Current indexes:");
        indexes.forEach(index => {
            console.log(`   - ${JSON.stringify(index.key)} (${index.name})`);
        });
        
        // Check if there's a problematic slug index
        const slugIndex = indexes.find(idx => idx.name === 'slug_1');
        if (slugIndex) {
            console.log("🗑️ Dropping problematic slug index...");
            await collection.dropIndex('slug_1');
            console.log("✅ Slug index dropped successfully");
        } else {
            console.log("ℹ️ No slug index found");
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        process.exit(0);
    }
};

checkProductIndexes();