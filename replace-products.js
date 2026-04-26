import "./src/env.js";
import { connectMongoDB } from "./src/Config/mongodb.js";
import { connectDB } from "./src/Config/db.js";
import { ProductRepository } from "./src/repositories/ProductRepository.js";
import fs from "fs/promises";

const getPriceForFormat = (format) => {
    switch (format) {
        case "hardCover":
            return 25;
        case "softCover":
            return 10;
        case "pdf":
            return 5;
        default:
            return 10;
    }
};

const replaceProducts = async () => {
    try {
        console.log("🔄 Replacing fake products with real Mowdmin books...");
        
        // Connect to database
        if (process.env.DB_CONNECTION === "mongodb") {
            await connectMongoDB();
        } else if (
            process.env.DB_CONNECTION === "postgres" ||
            process.env.DB_CONNECTION === "mysql"
        ) {
            await connectDB();
        }

        // Read products from products.json
        console.log("📖 Loading products from products.json...");
        const productsData = await fs.readFile('./products.json', 'utf8');
        const booksFromFile = JSON.parse(productsData);
        
        console.log(`📚 Found ${booksFromFile.length} books in products.json`);
        
        // Get current fake products count
        const currentProducts = await ProductRepository.findAll({ limit: 1000 });
        console.log(`🗑️ Found ${currentProducts.length} fake products to delete...`);
        
        // Clear all existing fake products
        if (currentProducts.length > 0) {
            const ProductModel = await ProductRepository.getModel();
            
            if (process.env.DB_CONNECTION === "mongodb") {
                await ProductModel.deleteMany({});
            } else {
                await ProductModel.destroy({ where: {} });
            }
            console.log(`✅ Deleted ${currentProducts.length} fake products`);
        }
        
        console.log(`📚 Creating real book products...`);
        
        // Convert books into individual product entries for each language/format combination
        const realProducts = [];
        
        // Define image URLs for each book
        const bookImageUrls = {
            "The Cry of the Image of God": "https://mowdmin.vercel.app/static/media/cry.0c05972c134d775b83c2.jpg",
            "The Seed of the Blessing": "https://mowdmin.vercel.app/static/media/seed.633a9cd12a83329a7a04.jpg",
            "PROPHECY And your RESPONSIBILITY In its ACCOMPLISHMENTS": "https://mowdmin.vercel.app/static/media/prophecy.03700452920de408efed.png"
        };
        
        booksFromFile.forEach(book => {
            book.languages.forEach(lang => {
                Object.entries(lang.formats).forEach(([format, stripeLink]) => {
                    const productName = `${book.name} (${lang.language} - ${format})`;
                    
                    realProducts.push({
                        name: productName,
                        description: book.description,
                        price: getPriceForFormat(format),
                        category: book.category,
                        stripeLink: stripeLink,
                        language: lang.language,
                        format: format,
                        baseTitle: book.name,
                        stock: 999, // Digital/print-on-demand, virtually unlimited
                        imageUrl: bookImageUrls[book.name] || null
                    });
                });
            });
        });
        
        console.log(`📦 Creating ${realProducts.length} product variations...`);
        
        // Create real products
        let createdCount = 0;
        for (const productData of realProducts) {
            try {
                await ProductRepository.create(productData);
                createdCount++;
                
                if (createdCount % 5 === 0 || createdCount === realProducts.length) {
                    console.log(`   ✅ Created ${createdCount}/${realProducts.length} products...`);
                }
            } catch (error) {
                console.error(`   ❌ Error creating "${productData.name}":`, error.message);
            }
        }
        
        console.log("\n🎉 Products Replacement Complete!");
        console.log(`📊 Summary:`);
        console.log(`   🗑️ Deleted fake products: ${currentProducts.length}`);
        console.log(`   📚 Base books processed: ${booksFromFile.length}`);
        console.log(`   📦 Product variations created: ${createdCount}`);
        console.log(`   ⚠️ Failed creations: ${realProducts.length - createdCount}`);
        
        // Show breakdown by book
        const bookSummary = {};
        realProducts.forEach(product => {
            if (!bookSummary[product.baseTitle]) {
                bookSummary[product.baseTitle] = [];
            }
            bookSummary[product.baseTitle].push(`${product.language} ${product.format}`);
        });
        
        console.log("\n📚 Books with Variations:");
        Object.entries(bookSummary).forEach(([title, variations]) => {
            console.log(`   "${title}": ${variations.length} variations`);
            console.log(`     -> ${variations.join(', ')}`);
        });
        
        if (createdCount === realProducts.length) {
            console.log("✅ All products successfully replaced with authentic Mowdmin books!");
        }
        
    } catch (error) {
        console.error("❌ Error replacing products:", error);
    } finally {
        process.exit(0);
    }
};

replaceProducts();
