
import { faker } from "@faker-js/faker";
import ProductRepository from "../repositories/ProductRepository.js"; // Default export
import { OrderRepository } from "../repositories/OrderRepository.js";
import { OrderItemRepository } from "../repositories/OrderItemRepository.js";
import { PaymentRepository } from "../repositories/PaymentRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";

const seedCommerce = async () => {
    try {
        console.log("🌱 Seeding Commerce (Products, Orders, Payments)...");
        const users = await UserRepository.findAll({}); // Get all users, assumes small DB for seed
        const limitUsers = users.slice(0, 10);

        // 1. Seed Products
        const products = [];
        for (let i = 0; i < 10; i++) {
            const product = await ProductRepository.create({
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                price: faker.commerce.price({ min: 10, max: 100 }), // String
                stock: faker.number.int({ min: 0, max: 100 }),
                category: faker.commerce.department(),
                images: [faker.image.url(), faker.image.url()],
                isActive: true,
            });
            products.push(product);
            console.log(`   bf Created Product: ${product.name} ($${product.price})`);
        }

        // 2. Seed Orders
        if (limitUsers.length > 0 && products.length > 0) {
            const numOrders = 10;
            for (let i = 0; i < numOrders; i++) {
                const user = faker.helpers.arrayElement(limitUsers);
                // Updated enum values: ['pending', 'paid', 'cancelled', 'shipped', 'completed']
                const status = faker.helpers.arrayElement(["pending", "paid", "shipped", "completed", "cancelled"]);

                const order = await OrderRepository.create({
                    userId: user.id,
                    status: status,
                    totalAmount: 0,
                    shippingAddress: faker.location.streetAddress() + ", " + faker.location.city(),
                    // trackingNumber field removed to match schema
                });

                // Order Items
                let total = 0;
                const numItems = faker.number.int({ min: 1, max: 5 });
                for (let j = 0; j < numItems; j++) {
                    const product = faker.helpers.arrayElement(products);
                    const quantity = faker.number.int({ min: 1, max: 3 });
                    const price = parseFloat(product.price);

                    await OrderItemRepository.create({
                        orderId: order.id,
                        productId: product.id,
                        quantity: quantity,
                        price: price,
                    });
                    total += price * quantity;
                }

                // Update Order total
                let updatedOrder = order;
                updatedOrder = await OrderRepository.updateById(order.id, { totalAmount: total });

                // Create Payment
                // Only create payment if order is not pending/cancelled to be realistic? 
                // Or if it IS paid/completed/shipped. 
                // Repository didn't show status enum for payment but let's assume 'completed' is safe or check model.
                // Assuming status 'completed' is fine for payment as per original seed.
                if (status !== "cancelled" && status !== "pending") {
                    await PaymentRepository.create({
                        orderId: order.id,
                        userId: user.id,
                        amount: total,
                        status: "completed",
                        reference: "PAY-" + faker.string.alphanumeric(8).toUpperCase(),
                        method: "credit_card",
                        webhookEventId: faker.string.uuid(),
                    });
                }
            }
        }

        console.log("✅ Commerce seeded successfully.");
    } catch (error) {
        console.error("❌ Error seeding commerce:", error);
    }
};


// Standalone execution support
import { connectMongoDB } from '../Config/mongodb.js';
import { connectDB } from '../Config/db.js';
import "../env.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

if (entryFile === __filename || entryFile?.endsWith('07-commerceSeeder.js')) {
    (async () => {
        try {
            if (process.env.DB_CONNECTION === 'mongodb') {
                await connectMongoDB();
            } else {
                await connectDB();
            }
            await seedCommerce();
            process.exit(0);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    })();
}

export default seedCommerce;
