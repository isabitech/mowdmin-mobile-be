import { EventRepository } from "../repositories/EventRepository.js";
import { connectMongoDB } from "../Config/mongodb.js";
import { connectDB } from "../Config/db.js";
import "../env.js";

// =======================
// EVENT DEFINITIONS
// =======================
const mowdminEvents = [
  // ONLINE PROGRAM
  {
    title: "Dayspring from on high hath visited us",
    description: "John 5v8. Every Monday Online Program",
    time: "19:00",
    location: "Online",
    type: "Online",
    recurring: "Every Monday",
  },
  {
    title: "The voice of the presence of God",
    description: "Psalm 29v3-4. Every 1st Sunday",
    time: "18:00",
    location: "Online",
    type: "Online",
    recurring: "1st Sunday",
  },
  {
    title: "Everyday people Everyday life",
    description: "Every 2nd Thursday",
    time: "19:00",
    location: "Online",
    type: "Online",
    recurring: "2nd Thursday",
  },
  {
    title: "My Rod shall blossom because I am the chosen one",
    description: "3rd Friday",
    time: "20:00",
    location: "Online",
    type: "Online",
    recurring: "3rd Friday",
  },
  {
    title: "Power that swallows up powers",
    description: "Last Wednesday",
    time: "19:00",
    location: "Online",
    type: "Online",
    recurring: "Last Wednesday",
  },
  {
    title: "Hour of the Truth",
    description: "Last Saturday",
    time: "18:00",
    location: "Online",
    type: "Online",
    recurring: "Last Saturday",
  },
  {
    title: "The Lord Supper",
    description: "First Sunday and last day of the month",
    time: "18:00",
    location: "TBD",
    type: "Communion",
    recurring: "Lord Supper",
  },

  // FIXED EVENTS
  {
    title: "Seminar: A fulfilling holistic well-being",
    description: "3 John 2 Seminar",
    date: "2026-05-16",
    time: "14:00",
    location:
      "Bürgersaal der Sachsenhalle, Sachsen-Halle, Piebrockskamp, 59073 Hamm Germany",
    type: "Seminar",
  },
  {
    title: "Evangelisation Tour - Benin Republic",
    description: "Open-air evangelism and gospel Music",
    date: "2026-09-04",
    time: "16:00",
    location: "Akpakpa/Plateau Benin Republic",
    type: "Tour",
  },
  {
    title: "Open-air evangelism and gospel Music",
    description:
      "Willy Brandt Platz, Opposite the railway station Hamm Germany",
    date: "2026-09-19",
    time: "15:00",
    location:
      "Willy Brandt Platz, 59065, Opposite the railway station Hamm Germany",
    type: "Tour",
  },
  {
    title: "Seminars, Follow-up, Education, Worship",
    description: "Bürgersaal der Sachsenhalle, Hamm Germany",
    date: "2026-09-20",
    time: "10:00",
    location:
      "Bürgersaal der Sachsenhalle, Sachsen-Halle, Piebrockskamp, 59073 Hamm Germany",
    type: "Seminar",
  },
];

// =======================
// DATE HELPERS
// =======================
const getAllDaysInYear = (year) => {
  const dates = [];
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(new Date(d));
  }

  return dates;
};

const isNthWeekday = (date, weekday, nth) => {
  if (date.getUTCDay() !== weekday) return false;

  const day = date.getUTCDate();
  const weekNumber = Math.ceil(day / 7);

  return weekNumber === nth;
};

const isLastWeekday = (date, weekday) => {
  if (date.getUTCDay() !== weekday) return false;

  const nextWeek = new Date(date);
  nextWeek.setUTCDate(date.getUTCDate() + 7);

  return nextWeek.getUTCMonth() !== date.getUTCMonth();
};

const isLastDayOfMonth = (date) => {
  const nextDay = new Date(date);
  nextDay.setUTCDate(date.getUTCDate() + 1);
  return nextDay.getUTCMonth() !== date.getUTCMonth();
};

const getDatesForRecurring = (year, type) => {
  const allDates = getAllDaysInYear(year);

  return allDates.filter((date) => {
    const day = date.getUTCDay();

    switch (type) {
      case "Every Monday":
        return day === 1;

      case "1st Sunday":
        return isNthWeekday(date, 0, 1);

      case "2nd Thursday":
        return isNthWeekday(date, 4, 2);

      case "3rd Friday":
        return isNthWeekday(date, 5, 3);

      case "Last Wednesday":
        return isLastWeekday(date, 3);

      case "Last Saturday":
        return isLastWeekday(date, 6);

      case "Lord Supper":
        return (
          isNthWeekday(date, 0, 1) || // first Sunday
          isLastDayOfMonth(date)
        );

      default:
        return false;
    }
  });
};

// =======================
// SEED FUNCTION
// =======================
const seedMowdmin2026 = async () => {
  try {
    console.log("🌱 Seeding Mowdministries 2026 Events...");

    // Connect DB
    if (process.env.DB_CONNECTION === "mongodb") {
      await connectMongoDB();
    } else {
      await connectDB();
    }

    // Clear old data
    const { EventModel, EventRegistrationModel } =
      await EventRepository.getModels();

    console.log("🗑️ Clearing existing data...");

    if (process.env.DB_CONNECTION === "mongodb") {
      await EventRegistrationModel.deleteMany({});
      await EventModel.deleteMany({});
    } else {
      await EventRegistrationModel.destroy({ where: {}, truncate: true });
      await EventModel.destroy({ where: {}, truncate: true });
    }

    console.log("✅ Cleared.");

    // Insert events
    for (const eventDef of mowdminEvents) {
      if (eventDef.recurring) {
        const dates = getDatesForRecurring(2026, eventDef.recurring);

        console.log(`🔁 ${eventDef.title} → ${dates.length} occurrences`);

        for (const date of dates) {
          try {
            await EventRepository.create({
              title: eventDef.title,
              description: eventDef.description,
              date,
              time: eventDef.time,
              location: eventDef.location,
              type: eventDef.type,
            });
          } catch (err) {
            console.error(
              `❌ Failed: ${eventDef.title} ${date.toISOString()}`,
              err,
            );
          }
        }
      } else {
        console.log(`📅 ${eventDef.title} → ${eventDef.date}`);

        try {
          await EventRepository.create({
            title: eventDef.title,
            description: eventDef.description,
            date: new Date(eventDef.date),
            time: eventDef.time,
            location: eventDef.location,
            type: eventDef.type,
          });
        } catch (err) {
          console.error(`❌ Failed: ${eventDef.title}`, err);
        }
      }
    }

    console.log("✅ Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

export default seedMowdmin2026;
