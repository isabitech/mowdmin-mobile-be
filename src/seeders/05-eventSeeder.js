
import { faker } from "@faker-js/faker";
import { EventRepository } from "../repositories/EventRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";

const seedEvents = async (count = 5) => {
    try {
        console.log(`🌱 Seeding ${count} events...`);
        const users = await UserRepository.findAll({});
        const slicedUsers = users.slice(0, 10);

        for (let i = 0; i < count; i++) {
            const event = await EventRepository.create({
                title: faker.lorem.words(3) + " Event",
                date: faker.date.future(),
                time: "10:00 AM",
                location: faker.location.streetAddress(),
                type: faker.helpers.arrayElement(["Crusade", "Baptism", "Communion", "Concert"]),
                // Description not in model, omitting
            });
            console.log(`   📅 Created Event: ${event.title} on ${event.date}`);

            // Register some users
            if (slicedUsers.length > 0) {
                const numReg = faker.number.int({ min: 0, max: 5 });
                for (let j = 0; j < numReg; j++) {
                    const user = faker.helpers.arrayElement(slicedUsers);
                    // Check duplication? Repo doesn't have findOneRegistration easily exposed usually?
                    // EventRepository has registrationfindAll
                    const exists = await EventRepository.registrationfindAll({
                        eventId: event.id, userId: user.id
                    });

                    if (exists.length === 0) {
                        await EventRepository.createRegistration({
                            eventId: event.id,
                            userId: user.id,
                            // registrationDate: new Date(), // Not in Mongo schema explicitly
                            status: "registered" // Changed from "Confirmed" to "registered"
                        });
                    }
                }
            }
        }

        console.log("✅ Events seeded successfully.");
    } catch (error) {
        console.error("❌ Error seeding events:", error);
    }
};


// Standalone execution support
import { connectMongoDB } from '../Config/mongodb.js';
import { connectDB } from '../Config/db.js';
import "../env.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

if (entryFile === __filename || entryFile?.endsWith('05-eventSeeder.js')) {
    (async () => {
        try {
            if (process.env.DB_CONNECTION === 'mongodb') {
                await connectMongoDB();
            } else {
                await connectDB();
            }
            await seedEvents();
            process.exit(0);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    })();
}

export default seedEvents;
