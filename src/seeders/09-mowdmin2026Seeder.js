
import { EventRepository } from "../repositories/EventRepository.js";
import { connectMongoDB } from '../Config/mongodb.js';
import { connectDB } from '../Config/db.js';
import "../env.js";

const mowdminEvents = [
    // ONLINE PROGRAM
    {
        title: "Dayspring from on high hath visited us",
        description: "John 5v8. Every Monday Online Program",
        time: "19:00",
        location: "Online",
        type: "Online",
        recurring: "Every Monday"
    },
    {
        title: "The voice of the presence of God",
        description: "Psalm 29v3-4. Every 1st Sunday of the Month Online Program",
        time: "18:00",
        location: "Online",
        type: "Online",
        recurring: "1st Sunday"
    },
    {
        title: "Everyday people Everyday life",
        description: "Every 2nd Thursday of the Month Online Program",
        time: "19:00",
        location: "Online",
        type: "Online",
        recurring: "2nd Thursday"
    },
    {
        title: "My Rod shall blossom because I am the chosen one",
        description: "Numbers 17:8; 1 Peter 2:9. Every 3rd Friday of the Month Online Program",
        time: "20:00",
        location: "Online",
        type: "Online",
        recurring: "3rd Friday"
    },
    {
        title: "Power that swallows up powers",
        description: "Colossians 2v15. Every last Wednesday of the Month Online Program",
        time: "19:00",
        location: "Online",
        type: "Online",
        recurring: "Last Wednesday"
    },
    {
        title: "Hour of the Truth",
        description: "John 8:32. Every last Saturday of the Month Online Program",
        time: "18:00",
        location: "Online",
        type: "Online",
        recurring: "Last Saturday"
    },

    // SPECIFIC DATES
    {
        title: "Seminar: A fulfilling holistic well-being",
        description: "In light of 3 John 2. Biblical insights on being healthy Seminars.",
        date: "2026-05-16",
        time: "14:00",
        location: "Bürgersaal der Sachsenhalle, Sachsen-Halle, Piebrockskamp, 59073 Hamm Germany",
        type: "Seminar"
    },
    {
        title: "Evangelisation Tour - Benin Republic",
        description: "Open-air evangelism and gospel Music",
        date: "2026-09-04",
        time: "16:00",
        location: "Akpakpa/Plateau Benin Republic",
        type: "Tour"
    },
    {
        title: "Evangelisation Tour - Kenya",
        description: "Open-air evangelism and gospel Music",
        date: "2026-09-10",
        time: "16:00",
        location: "Kenya",
        type: "Tour"
    },
    {
        title: "Evangelisation Tour - Tanzania",
        description: "Open-air evangelism and gospel Music",
        date: "2026-09-15",
        time: "16:00",
        location: "Tanzania",
        type: "Tour"
    },
    {
        title: "Evangelisation Tour - Pakistan",
        description: "Open-air evangelism and gospel Music",
        date: "2026-09-25",
        time: "16:00",
        location: "Pakistan",
        type: "Tour"
    },
    {
        title: "Open-air evangelism and gospel Music",
        description: "Willy Brandt Platz, Opposite the railway station Hamm Germany",
        date: "2026-09-19",
        time: "15:00",
        location: "Willy Brandt Platz, 59065, Opposite the railway station Hamm Germany",
        type: "Tour"
    },
    {
        title: "Seminars, Follow-up, Education, Worship, Gospel Music",
        description: "Bürgersaal der Sachsenhalle, Hamm Germany",
        date: "2026-09-20",
        time: "10:00",
        location: "Bürgersaal der Sachsenhalle, Sachsen-Halle, Piebrockskamp, 59073 Hamm Germany",
        type: "Seminar"
    },

    // PLACEHOLDERS / RECURRING
    { title: "Next Open Air Evangelization", date: "2026-10-10", time: "12:00", location: "TBD", type: "Tour", description: "Upcoming Open Air Evangelization" },
    { title: "Next Water Baptism", date: "2026-06-20", time: "10:00", location: "TBD", type: "Baptism", description: "Upcoming Water Baptism" },
    {
        title: "The Lord Supper",
        description: "The Lord Supper - Every first Sunday and last day of the month.",
        time: "18:00",
        location: "TBD",
        type: "Communion",
        recurring: "Lord Supper"
    },
    { title: "The Holy Spirit Convention", date: "2026-08-15", time: "09:00", location: "TBD", type: "Convention", description: "The Holy Spirit Convention" },
    { title: "The Conference", date: "2026-11-20", time: "09:00", location: "TBD", type: "Conference", description: "Annual Conference" },
    { title: "Symposium", date: "2026-12-05", time: "14:00", location: "TBD", type: "Symposium", description: "End of year Symposium" },
    { title: "Concert", date: "2026-12-24", time: "18:00", location: "TBD", type: "Concert", description: "Christmas Concert" }
];

const getDatesForRecurring = (year, recurringType) => {
    const dates = [];
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year, 11, 31));

    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
        const day = d.getUTCDay();
        const date = d.getUTCDate();
        const month = d.getUTCMonth();

        if (recurringType === "Every Monday" && day === 1) {
            dates.push(new Date(d));
        } else if (recurringType === "1st Sunday" && day === 0 && date <= 7) {
            dates.push(new Date(d));
        } else if (recurringType === "2nd Thursday" && day === 4 && date > 7 && date <= 14) {
            dates.push(new Date(d));
        } else if (recurringType === "3rd Friday" && day === 5 && date > 14 && date <= 21) {
            dates.push(new Date(d));
        } else if (recurringType === "Last Wednesday" && day === 3) {
            const nextWeek = new Date(d);
            nextWeek.setUTCDate(d.getUTCDate() + 7);
            if (nextWeek.getUTCMonth() !== month) {
                dates.push(new Date(d));
            }
        } else if (recurringType === "Last Saturday" && day === 6) {
            const nextWeek = new Date(d);
            nextWeek.setUTCDate(d.getUTCDate() + 7);
            if (nextWeek.getUTCMonth() !== month) {
                dates.push(new Date(d));
            }
        } else if (recurringType === "Lord Supper") {
            // Every 1st Sunday
            if (day === 0 && date <= 7) {
                dates.push(new Date(d));
            }
            // Every last day of the month
            const nextDay = new Date(d);
            nextDay.setUTCDate(d.getUTCDate() + 1);
            if (nextDay.getUTCMonth() !== month) {
                // Prevent doubling if 1st Sunday is also last day (unlikely but safe)
                if (!dates.some(dt => dt.getTime() === d.getTime())) {
                    dates.push(new Date(d));
                }
            }
        }
    }
    return dates;
};

const seedMowdmin2026 = async () => {
    try {
        console.log("🌱 Seeding Mowdministries 2026 Program Events...");

        if (process.env.DB_CONNECTION === 'mongodb') {
            await connectMongoDB();
        } else if (process.env.DB_CONNECTION === 'postgres' || process.env.DB_CONNECTION === 'mysql') {
            await connectDB();
        } else {
            console.warn("⚠️ No valid DB_CONNECTION found.");
        }

        const titlesToClear = [...new Set(mowdminEvents.map(e => e.title))];
        console.log(`🧹 Clearing existing events for: ${titlesToClear.length} titles...`);
        const { EventModel } = await EventRepository.getModels();

        for (const title of titlesToClear) {
            if (process.env.DB_CONNECTION === 'mongodb') {
                await EventModel.deleteMany({ title });
            } else if (EventModel && EventModel.destroy) {
                await EventModel.destroy({ where: { title } });
            }
        }

        for (const eventDef of mowdminEvents) {
            if (eventDef.recurring) {
                const dates = getDatesForRecurring(2026, eventDef.recurring);
                console.log(`   🔁 Creating recurring event: ${eventDef.title} (${dates.length} occurrences)`);
                for (const date of dates) {
                    await EventRepository.create({
                        title: eventDef.title,
                        description: eventDef.description,
                        date: date,
                        time: eventDef.time,
                        location: eventDef.location,
                        type: eventDef.type
                    });
                }
            } else {
                console.log(`   📅 Creating event: ${eventDef.title} on ${eventDef.date}`);
                await EventRepository.create({
                    title: eventDef.title,
                    description: eventDef.description,
                    date: new Date(eventDef.date),
                    time: eventDef.time,
                    location: eventDef.location,
                    type: eventDef.type
                });
            }
        }

        console.log("✅ Mowdministries 2026 Program Events seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding events:", error);
        process.exit(1);
    }
};

seedMowdmin2026();
