import "../env.js";
import { faker } from "@faker-js/faker";
import { UserRepository } from "../repositories/UserRepository.js";
import ProfileRepository from "../repositories/ProfileRepository.js";
import { PrayerRequestRepository } from "../repositories/PrayerRequestRepository.js";

const seedUsers = async (count = 10) => {
  try {
    const isMongo = process.env.DB_CONNECTION === "mongodb";
    let UserMongoModel;
    let ProfileMongoModel;
    let PrayerRequestMongoModel;

    if (isMongo) {
      const [userModel, profileModel, prayerRequestModel] = await Promise.all([
        import("../MongoModels/UserMongoModel.js"),
        import("../MongoModels/ProfileMongoModel.js"),
        import("../MongoModels/PrayerRequestMongoModel.js"),
      ]);

      UserMongoModel = userModel.default;
      ProfileMongoModel = profileModel.default;
      PrayerRequestMongoModel = prayerRequestModel.default;
    }

    console.log(`🌱 Seeding ${count} users and their prayer requests...`);

    for (let i = 0; i < count; i++) {
      const email = faker.internet.email();
      const existingUser = isMongo
        ? await UserMongoModel.findOne({ email })
        : await UserRepository.findByEmail(email);

      if (existingUser) continue;

      const user = isMongo
        ? await UserMongoModel.create({
            name: faker.person.fullName(),
            email: email,
            password: "Password123!", // Will be hashed by model hook
            isAdmin: false,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          })
        : await UserRepository.create({
            name: faker.person.fullName(),
            email: email,
            password: "Password123!", // Will be hashed, same for all test users
            isAdmin: false,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          });
      console.log(`   👤 Created user: ${user.email} (${user.id || user._id})`);

      // Create Profile
      if (isMongo) {
        await ProfileMongoModel.create({
          userId: user._id,
          displayName: user.name,
          photoUrl: faker.image.avatar(),
          bio: faker.lorem.sentence(),
          location: `${faker.location.city()}, ${faker.location.country()}`,
          phone_number: faker.phone.number(),
          birthdate: faker.date.birthdate(),
          language: faker.helpers.arrayElement(["EN", "FR", "DE"]),
        });
      } else {
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
      }

      // Create 1-3 Prayer Requests per user
      const requestCount = faker.number.int({ min: 1, max: 3 });
      for (let j = 0; j < requestCount; j++) {
        if (isMongo) {
          await PrayerRequestMongoModel.create({
            userId: user._id,
            title: faker.lorem.sentence(4),
            description: faker.lorem.paragraph(),
            images: [faker.image.urlPicsumPhotos()],
            isPublic: faker.datatype.boolean(),
          });
        } else {
          await PrayerRequestRepository.create({
            userId: user.id || user._id,
            title: faker.lorem.sentence(4),
            description: faker.lorem.paragraph(),
            images: [faker.image.urlPicsumPhotos()],
            isPublic: faker.datatype.boolean(),
          });
        }
      }
      console.log(
        `      🙏 Created ${requestCount} prayer requests for ${user.email}`,
      );
    }

    console.log("✅ Users seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  }
};

// Standalone execution support
import { connectMongoDB } from "../Config/mongodb.js";
import { connectDB } from "../Config/db.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

if (entryFile === __filename || entryFile?.endsWith("02-userSeeder.js")) {
  (async () => {
    try {
      if (process.env.DB_CONNECTION === "mongodb") {
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
