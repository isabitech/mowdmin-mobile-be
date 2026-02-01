
import { UserRepository } from "../repositories/UserRepository.js";
import { connectMongoDB } from '../Config/mongodb.js';
import { connectDB } from '../Config/db.js';
import "../env.js";
import { fileURLToPath } from 'url';

const seedAdmin = async () => {
    try {
        const adminEmail = "admin@mowdmin.com";
        const existingAdmin = await UserRepository.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log("⚠️ Admin user already exists.");
            return;
        }

        const newAdmin = await UserRepository.create({
            name: "Super Admin",
            email: adminEmail,
            password: "password123", // Will be hashed by beforeCreate hook
            role: "admin",
            isAdmin: true,
            emailVerified: true,
            emailVerifiedAt: new Date(),
        });

        console.log("✅ Admin user created successfully:", newAdmin.email);
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
    }
};

const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

if (entryFile === __filename || entryFile?.endsWith('01-adminSeeder.js')) {
    (async () => {
        if (process.env.DB_CONNECTION === 'mongodb') {
            await connectMongoDB();
        } else {
            await connectDB();
        }
        await seedAdmin();
        process.exit(0);
    })();
}

export default seedAdmin;
