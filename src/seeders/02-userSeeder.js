import "../env.js";
import { faker } from "@faker-js/faker";
import { fileURLToPath } from "url";
import { connectDB } from "../Config/db.js";
import { connectMongoDB } from "../Config/mongodb.js";
import ProfileRepository from "../repositories/ProfileRepository.js";
import { PrayerRequestRepository } from "../repositories/PrayerRequestRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { prayerRequestTemplates } from "./08-prayerSeeder.js";

const seedUsers = async (count = 10, options = {}) => {
  try {
    const { withPrayerRequests = false } = options;
    const isMongo = process.env.DB_CONNECTION === "mongodb";
    let UserMongoModel;
    let ProfileMongoModel;
    let PrayerRequestMongoModel;

    if (isMongo) {
      const modelImports = [
        import("../MongoModels/UserMongoModel.js"),
        import("../MongoModels/ProfileMongoModel.js"),
      ];

      if (withPrayerRequests) {
        modelImports.push(import("../MongoModels/PrayerRequestMongoModel.js"));
      }

      const [userModel, profileModel, prayerRequestModel] =
        await Promise.all(modelImports);

      UserMongoModel = userModel.default;
      ProfileMongoModel = profileModel.default;
      PrayerRequestMongoModel = prayerRequestModel?.default;
    }

    console.log(
      withPrayerRequests
        ? `Seeding ${count} users and their prayer requests...`
        : `Seeding ${count} users without prayer requests...`,
    );
    let requestTemplateIndex = 0;

    for (let i = 0; i < count; i++) {
      const email = faker.internet.email();
      const existingUser = isMongo
        ? await UserMongoModel.findOne({ email })
        : await UserRepository.findByEmail(email);

      if (existingUser) continue;

      const user = isMongo
        ? await UserMongoModel.create({
            name: faker.person.fullName(),
            email,
            password: "Password123!",
            isAdmin: false,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          })
        : await UserRepository.create({
            name: faker.person.fullName(),
            email,
            password: "Password123!",
            isAdmin: false,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          });
      console.log(`Created user: ${user.email} (${user.id || user._id})`);

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

      if (withPrayerRequests) {
        const requestCount = faker.number.int({ min: 1, max: 3 });
        for (let j = 0; j < requestCount; j++) {
          const template =
            prayerRequestTemplates[
              requestTemplateIndex % prayerRequestTemplates.length
            ];
          requestTemplateIndex += 1;

          const payload = {
            userId: user.id || user._id,
            title: template.title,
            description: template.description,
            images: [],
            isPublic: template.isPublic,
          };

          if (isMongo) {
            await PrayerRequestMongoModel.create({
              ...payload,
              userId: user._id,
            });
          } else {
            await PrayerRequestRepository.create(payload);
          }
        }

        console.log(`Created ${requestCount} prayer requests for ${user.email}`);
      }
    }

    if (!withPrayerRequests) {
      console.log(
        "Prayer request seeding is disabled by default. Pass --with-prayer-requests to add canned requests.",
      );
    }
    console.log("Users seeded successfully.");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

if (entryFile === __filename || entryFile?.endsWith("02-userSeeder.js")) {
  (async () => {
    try {
      const parsedCount = Number.parseInt(process.argv[2], 10);
      const count = Number.isFinite(parsedCount) ? parsedCount : 10;
      const withPrayerRequests = process.argv.includes("--with-prayer-requests");

      if (process.env.DB_CONNECTION === "mongodb") {
        await connectMongoDB();
      } else {
        await connectDB();
      }
      await seedUsers(count, { withPrayerRequests });
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}

export default seedUsers;
