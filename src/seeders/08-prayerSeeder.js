
import { faker } from "@faker-js/faker";
import { UserRepository } from "../repositories/UserRepository.js";
import { PrayerRequestRepository } from "../repositories/PrayerRequestRepository.js";
import { PrayerRepository } from "../repositories/PrayerRepository.js";

const seedPrayers = async () => {
    try {
        console.log("🌱 Seeding prayers (Requests and Wall)...");

        // Fetch some users and existing requests
        const adminEmail = "admin@mowdmin.com";
        const admin = await UserRepository.findByEmail(adminEmail);

        const allRequests = await PrayerRequestRepository.findAll({ limit: 20 });
        if (allRequests.length === 0) {
            console.log("⚠️ No prayer requests found for seeding the wall. Please run user seeder first.");
            return;
        }

        // Get generic users
        const users = await UserRepository.findAll({ limit: 5 });
        if (users.length === 0) {
            console.log("⚠️ No users found for seeding prayers. Please run user seeder first.");
            return;
        }

        // 1. Seed Prayer Wall (Prayers)
        // Some from requests, some direct from admin

        // From existing requests (Admin promoted)
        const promotedRequests = faker.helpers.arrayElements(allRequests, Math.min(allRequests.length, 10));
        for (const req of promotedRequests) {
            const prayer = await PrayerRepository.create({
                userId: req.userId,
                prayerRequestId: req.id || req._id,
                title: req.title,
                description: req.description,
                images: req.images,
                isPublic: true,
                likeCount: faker.number.int({ min: 0, max: 20 }),
                commentCount: faker.number.int({ min: 0, max: 10 })
            });
            console.log(`       🔗 Promoted Request to Wall: ${prayer.title}`);
        }

        // Direct admin prayers
        for (let i = 0; i < 5; i++) {
            const prayer = await PrayerRepository.create({
                userId: admin.id || admin._id,
                title: faker.lorem.sentence(3),
                description: faker.lorem.paragraph(),
                images: [faker.image.urlPicsumPhotos()],
                isPublic: true,
                likeCount: faker.number.int({ min: 0, max: 10 }),
                commentCount: faker.number.int({ min: 0, max: 5 })
            });
            console.log(`       ✨ Created Direct Admin Prayer: ${prayer.title}`);
        }

        console.log("✅ Prayers seeded successfully.");
    } catch (error) {
        console.error("❌ Error seeding prayers:", error);
    }
};

export default seedPrayers;
