import "./src/env.js";
import { connectMongoDB } from "./src/Config/mongodb.js";
import { connectDB } from "./src/Config/db.js";
import mongoose from "mongoose";

const checkProducts = async () => {
    try {
        console.log("🔍 Fetching products from database...");
        
        // Connect to database
        if (process.env.DB_CONNECTION === "mongodb") {
            await connectMongoDB();
        } else if (
            process.env.DB_CONNECTION === "postgres" ||
            process.env.DB_CONNECTION === "mysql"
        ) {
            await connectDB();
        }

        // Import the repository to get the model
        const { ProductRepository } = await import("./src/repositories/ProductRepository.js");
        
        // Get all products
        const products = await ProductRepository.findAll({ limit: 1000 });
        
        console.log(`\n📊 Total Products Found: ${products.length}\n`);
        
        if (products.length === 0) {
            console.log("✅ No products found in database.");
            return;
        }
        
        console.log("🛍️ Current Products:");
        products.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.name}`);
            console.log(`   Description: ${product.description ? product.description.substring(0, 80) + '...' : 'N/A'}`);
            console.log(`   Price: ${product.price ? `$${product.price}` : 'N/A'}`);
            console.log(`   Category: ${product.category || 'N/A'}`);
            console.log(`   Stock: ${product.stock || 'N/A'}`);
            if (product.imageUrl) {
                console.log(`   Image: ${product.imageUrl}`);
            }
            
            // Add Stripe information
            if (product.stripeProductId) {
                const stripeEnv = process.env.STRIPE_ENV || 'test';
                const stripeBaseUrl = stripeEnv === 'live' ? 'https://dashboard.stripe.com' : 'https://dashboard.stripe.com/test';
                const stripeProductUrl = `${stripeBaseUrl}/products/${product.stripeProductId}`;
                console.log(`   🔗 Stripe Product: ${stripeProductUrl}`);
            }
            
            if (product.stripeLink && product.stripeLink !== product.stripeProductId) {
                console.log(`   🔗 Stripe Link: ${product.stripeLink}`);
            }
            
            if (!product.stripeProductId && !product.stripeLink) {
                console.log(`   🔗 Stripe: Not configured`);
            }
            
            console.log(`   Created: ${product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}`);
        });
        
        // Group products by category
        const productsByCategory = {};
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            if (!productsByCategory[category]) {
                productsByCategory[category] = [];
            }
            productsByCategory[category].push(product);
        });
        
        console.log(`\n📋 Summary:`);
        console.log(`   - Total products: ${products.length}`);
        console.log(`   - Products with descriptions: ${products.filter(p => p.description).length}`);
        console.log(`   - Products with prices: ${products.filter(p => p.price).length}`);
        console.log(`   - Products with stock info: ${products.filter(p => p.stock).length}`);
        console.log(`   - Products with images: ${products.filter(p => p.imageUrl).length}`);
        console.log(`   - Products with Stripe IDs: ${products.filter(p => p.stripeProductId).length}`);
        console.log(`   - Products with Stripe links: ${products.filter(p => p.stripeLink).length}`);
        
        console.log(`\n📊 Products by Category:`);
        for (const [category, categoryProducts] of Object.entries(productsByCategory)) {
            console.log(`   ${category}: ${categoryProducts.length} products`);
            
            // Calculate total value for each category
            const categoryValue = categoryProducts.reduce((sum, product) => {
                return sum + (parseFloat(product.price) || 0);
            }, 0);
            
            if (categoryValue > 0) {
                console.log(`     Total value: $${categoryValue.toFixed(2)}`);
            }
        }
        
    } catch (error) {
        console.error("❌ Error fetching products:", error);
    } finally {
        process.exit(0);
    }
};

checkProducts();