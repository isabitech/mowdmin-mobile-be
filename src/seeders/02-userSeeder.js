
import { faker } from "@faker-js/faker";
import { UserRepository } from "../repositories/UserRepository.js";
import ProfileRepository from "../repositories/ProfileRepository.js";

const seedUsers = async (count = 10) => {
    try {
        console.log(`🌱 Seeding ${count} users...`);

        for (let i = 0; i < count; i++) {
            const email = faker.internet.email();
            const existingUser = await UserRepository.findByEmail(email);

            if (existingUser) continue;

            const user = await UserRepository.create({
                name: faker.person.fullName(),
                email: email,
                password: "password123", // Will be hashed, same for all test users
                isAdmin: false,
                emailVerified: true,
                emailVerifiedAt: new Date(),
            });

            // Create Profile
            // ProfileRepository has create method
            await ProfileRepository.create({
                userId: user.id,
                phoneNumber: faker.phone.number(),
                address: faker.location.streetAddress(),
                city: faker.location.city(),
                country: faker.location.country(),
                dateOfBirth: faker.date.birthdate(),
                gender: faker.helpers.arrayElement(["Male", "Female", "Other"]),
                bio: faker.lorem.sentence(),
                avatar: faker.image.avatar(),
            });
        }

        console.log("✅ Users seeded successfully.");
    } catch (error) {
        console.error("❌ Error seeding users:", error);
    }
};

export default seedUsers;
