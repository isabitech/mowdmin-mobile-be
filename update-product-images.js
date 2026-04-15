import "./src/env.js";
import { connectMongoDB } from "./src/Config/mongodb.js";
import { ProductRepository } from "./src/repositories/ProductRepository.js";

const updateProductImages = async () => {
    try {
        console.log("🖼️ Adding book cover images to products...");
        
        // Connect to database
        if (process.env.DB_CONNECTION === "mongodb") {
            await connectMongoDB();
        } else if (
            process.env.DB_CONNECTION === "postgres" ||
            process.env.DB_CONNECTION === "mysql"
        ) {
            await connectDB();
        }

        // Define image mappings
        const imageMap = {
            "PROPHECY And your RESPONSIBILITY In its ACCOMPLISHMENTS": "https://mowdmin.vercel.app/static/media/prophecy.03700452920de408efed.png",
            "The Cry of the Image of God": "https://mowdmin.vercel.app/static/media/cry.0c05972c134d775b83c2.jpg", 
            "The Seed of the Blessing": "https://mowdmin.vercel.app/static/media/seed.633a9cd12a83329a7a04.jpg"
        };

        console.log("📚 Image mappings:");
        Object.entries(imageMap).forEach(([book, url]) => {
            console.log(`   "${book}": ${url}`);
        });

        // Get all products
        const allProducts = await ProductRepository.findAll({ limit: 1000 });
        console.log(`\n🔍 Found ${allProducts.length} products to update`);

        const ProductModel = await ProductRepository.getModel();
        let updatedCount = 0;
        let errors = 0;

        // Update each product with the correct image
        for (const product of allProducts) {
            try {
                // Find which book this product belongs to
                let bookTitle = null;
                let imageUrl = null;

                for (const [title, url] of Object.entries(imageMap)) {
                    if (product.name.includes(title)) {
                        bookTitle = title;
                        imageUrl = url;
                        break;
                    }
                }

                if (!imageUrl) {
                    console.log(`   ⚠️ No image found for: "${product.name}"`);
                    continue;
                }

                // Update the product
                if (process.env.DB_CONNECTION === "mongodb") {
                    await ProductModel.findByIdAndUpdate(
                        product._id, 
                        { imageUrl: imageUrl },
                        { new: true }
                    );
                } else {
                    await ProductModel.update(
                        { imageUrl: imageUrl },
                        { where: { id: product.id } }
                    );
                }

                updatedCount++;
                
                if (updatedCount % 5 === 0 || updatedCount === allProducts.length) {
                    console.log(`   ✅ Updated ${updatedCount}/${allProducts.length} products...`);
                }
                
            } catch (error) {
                errors++;
                console.error(`   ❌ Error updating "${product.name}":`, error.message);
            }
        }

        console.log("\n🎉 Product Image Update Complete!");
        console.log(`📊 Summary:`);
        console.log(`   🖼️ Products updated: ${updatedCount}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   📚 Books processed: ${Object.keys(imageMap).length}`);

        // Show breakdown by book
        const bookUpdates = {};
        Object.keys(imageMap).forEach(book => {
            const count = allProducts.filter(p => p.name.includes(book)).length;
            bookUpdates[book] = count;
        });

        console.log("\n📖 Updates by Book:");
        Object.entries(bookUpdates).forEach(([book, count]) => {
            console.log(`   "${book}": ${count} variations updated`);
        });

        if (updatedCount === allProducts.length) {
            console.log("✅ All products now have cover images!");
        }

    } catch (error) {
        console.error("❌ Error updating product images:", error);
    } finally {
        process.exit(0);
    }
};

updateProductImages();