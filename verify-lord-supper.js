
import { EventRepository } from "./src/repositories/EventRepository.js";
import { connectMongoDB } from './src/Config/mongodb.js';
import "./src/env.js";

const verify = async () => {
    try {
        await connectMongoDB();
        const lordSupperEvents = await EventRepository.findAll({ title: "The Lord Supper" });
        console.log(`📊 Lord Supper occurrences: ${lordSupperEvents.length}`);

        lordSupperEvents.slice(0, 5).forEach(e => {
            console.log(`   - ${e.date.toISOString().split('T')[0]} at ${e.time}`);
        });

        if (lordSupperEvents.length === 24) {
            console.log("✅ Verification successful: Lord Supper seeded correctly.");
        } else {
            console.log("❌ Verification failed: Expected 24 occurrences.");
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
verify();
