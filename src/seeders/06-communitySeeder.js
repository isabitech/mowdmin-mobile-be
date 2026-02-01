
import { faker } from "@faker-js/faker";
import { GroupRepository } from "../repositories/GroupRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";

const seedCommunity = async (count = 5) => {
    try {
        console.log(`🌱 Seeding ${count} community groups...`);
        const users = await UserRepository.findAll({});
        const limitUsers = users.slice(0, 20);

        if (limitUsers.length === 0) {
            console.warn("⚠️ No users found. Skipping community seeding.");
            return;
        }

        for (let i = 0; i < count; i++) {
            const creator = faker.helpers.arrayElement(limitUsers);
            const group = await GroupRepository.createGroup({
                name: faker.company.name() + " Group",
                description: faker.lorem.sentence(),
                creatorId: creator.id,
                isPrivate: faker.datatype.boolean(),
                icon: faker.image.avatar(),
            });
            console.log(`   👥 Created Group: ${group.name}`);

            // Add Members
            const numMembers = faker.number.int({ min: 2, max: 8 });
            const members = [];
            for (let j = 0; j < numMembers; j++) {
                const user = faker.helpers.arrayElement(limitUsers);
                // Avoid duplicates
                if (user.id === creator.id) continue;

                // Check local memory first
                const existing = members.find(m => m.id === user.id);
                if (existing) continue;

                // Check DB (optional for simpler seeders, using Try/Catch or just simple check)
                // GroupRepository doesn't have isMember check easily exposed but has findMembersByGroup
                const dbMembers = await GroupRepository.findMembersByGroup(group.id);
                const isDbMember = dbMembers.find(m => m.userId === user.id);
                if (isDbMember) continue;

                members.push(user);

                await GroupRepository.addMember({
                    groupId: group.id,
                    userId: user.id,
                    role: "Member",
                    joinedAt: faker.date.recent(),
                });
            }

            // Add creator as Admin (if not auto-added by Group creation logic, usually manual)
            // Check if already member
            const dbMembers = await GroupRepository.findMembersByGroup(group.id);
            const isCreatorMember = dbMembers.find(m => m.userId === creator.id);
            if (!isCreatorMember) {
                await GroupRepository.addMember({
                    groupId: group.id,
                    userId: creator.id,
                    role: "Admin",
                    joinedAt: new Date(),
                });
            }

            // Add Messages
            const numMessages = faker.number.int({ min: 5, max: 20 });
            const allGroupUsers = [creator, ...members];

            for (let k = 0; k < numMessages; k++) {
                const sender = faker.helpers.arrayElement(allGroupUsers);
                await GroupRepository.createMessage({
                    groupId: group.id,
                    senderId: sender.id,
                    content: faker.lorem.sentence(),
                    sentAt: faker.date.recent(),
                    readBy: [],
                });
            }
        }

        console.log("✅ Community seeded successfully.");
    } catch (error) {
        console.error("❌ Error seeding community:", error);
    }
};


// Standalone execution support
import { connectMongoDB } from '../Config/mongodb.js';
import { connectDB } from '../Config/db.js';
import "../env.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

if (entryFile === __filename || entryFile?.endsWith('06-communitySeeder.js')) {
    (async () => {
        try {
            if (process.env.DB_CONNECTION === 'mongodb') {
                await connectMongoDB();
            } else {
                await connectDB();
            }
            await seedCommunity();
            process.exit(0);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    })();
}

export default seedCommunity;
