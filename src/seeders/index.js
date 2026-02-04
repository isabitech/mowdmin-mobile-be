
import "../env.js"; // Ensure env vars are loaded first!
import { connectMongoDB } from '../Config/mongodb.js';
import { connectDB } from '../Config/db.js';

import seedAdmin from "./01-adminSeeder.js";
import seedUsers from "./02-userSeeder.js";
import seedMinistries from "./03-ministrySeeder.js";
import seedContent from "./04-contentSeeder.js";
import seedEvents from "./05-eventSeeder.js";
import seedCommunity from "./06-communitySeeder.js";
import seedCommerce from "./07-commerceSeeder.js";
import seedPrayers from "./08-prayerSeeder.js";

const runSeeders = async () => {
    try {
        if (process.env.DB_CONNECTION === 'mongodb') {
            console.log('🔄 Connecting to MongoDB for seeding...');
            await connectMongoDB();
        } else {
            console.log('🔄 Connecting to SQL Database for seeding...');
            await connectDB();
        }

        console.log("🚀 Starting Seeder...");

        await seedAdmin();
        await seedUsers(20);
        await seedMinistries();
        await seedContent();
        await seedEvents();
        await seedCommunity();
        await seedCommerce();
        await seedPrayers();

        console.log("🎉 All seeders executed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeder failed:", error);
        process.exit(1);
    }
};

runSeeders();
