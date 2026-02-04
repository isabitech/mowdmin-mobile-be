
import { faker } from "@faker-js/faker";
import { UserRepository } from "../repositories/UserRepository.js";
import ProfileRepository from "../repositories/ProfileRepository.js";
import { PrayerRequestRepository } from "../repositories/PrayerRequestRepository.js";

const seedUsers = async (count = 10) => {
    try {
        console.log(`🌱 Seeding ${count} users and their prayer requests...`);

        for (let i = 0; i < count; i++) {
            const email = faker.internet.email();
            const existingUser = await UserRepository.findByEmail(email);

            if (existingUser) continue;

            const user = await UserRepository.create({
                name: faker.person.fullName(),
                email: email,
                password: "Password123!", // Will be hashed, same for all test users
                isAdmin: false,
                emailVerified: true,
                emailVerifiedAt: new Date(),
            });
            console.log(`   👤 Created user: ${user.email} (${user.id || user._id})`);

            // Create Profile
            await ProfileRepository.create({
                userId: user.id || user._id,
                phoneNumber: faker.phone.number(),
                address: faker.location.streetAddress(),
                city: faker.location.city(),
                country: faker.location.country(),
                dateOfBirth: faker.date.birthdate(),
                gender: faker.helpers.arrayElement(["Male", "Female", "Other"]),
                bio: faker.lorem.sentence(),
                avatar: faker.image.avatar(),
            });

            // Create 1-3 Prayer Requests per user
            const requestCount = faker.number.int({ min: 1, max: 3 });
            for (let j = 0; j < requestCount; j++) {
                await PrayerRequestRepository.create({
                    userId: user.id || user._id,
                    title: faker.lorem.sentence(4),
                    description: faker.lorem.paragraph(),
                    images: [faker.image.urlPicsumPhotos()],
                    isPublic: faker.datatype.boolean()
                });
            }
            console.log(`      🙏 Created ${requestCount} prayer requests for ${user.email}`);
        }

        console.log("✅ Users seeded successfully.");
    } catch (error) {
        console.error("❌ Error seeding users:", error);
    }
};


// Standalone execution support
import { connectMongoDB } from '../Config/mongodb.js';
import { connectDB } from '../Config/db.js';
import "../env.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

if (entryFile === __filename || entryFile?.endsWith('02-userSeeder.js')) {
    (async () => {
        try {
            if (process.env.DB_CONNECTION === 'mongodb') {
                await connectMongoDB();
            } else {
                await connectDB();
            }
            await seedUsers();
            process.exit(0);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    })();
}

export default seedUsers;
