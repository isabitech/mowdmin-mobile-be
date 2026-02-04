
import { faker } from "@faker-js/faker";
import { MediaCategoryRepository } from "../repositories/MediaCategoryRepository.js";
import { MediaRepository } from "../repositories/MediaRepository.js";
import { BibleRepository } from "../repositories/BibleRepository.js";

const seedContent = async () => {
    try {
        console.log("🌱 Seeding Content (Categories, Media, Bible Stories)...");

        // 1. Seed Categories
        const categories = ["Sermons", "Worship", "Testimonies", "Podcasts"];
        const categoryInstances = [];

        for (const catName of categories) {
            // Updated Repository has findOne
            let cat = await MediaCategoryRepository.findOne({ name: catName });
            if (!cat) {
                cat = await MediaCategoryRepository.create({
                    name: catName,
                    description: `All about ${catName}`,
                    thumbnail: faker.image.urlPicsumPhotos(),
                });
            }
            categoryInstances.push(cat);
        }

        // 2. Seed Media
        for (const cat of categoryInstances) {
            const numMedia = faker.number.int({ min: 3, max: 8 });
            for (let i = 0; i < numMedia; i++) {
                const media = await MediaRepository.create({
                    title: faker.lorem.sentence(3),
                    description: faker.lorem.paragraph(),
                    category_id: cat.id || cat._id, // Ensure we get the ID regardless of DB type
                    type: faker.helpers.arrayElement(["audio", "video"]),
                    media_url: faker.internet.url(), // Placeholder
                    author: faker.person.fullName(),
                    duration: `${faker.number.int({ min: 5, max: 60 })}:00`,
                    is_downloadable: faker.datatype.boolean(),
                    language: "EN",
                    thumbnail: faker.image.urlPicsumPhotos(),
                    isLive: false
                });
                console.log(`       🎵/🎬 Created Media in ${cat.name} (CatID: ${cat.id || cat._id}): ${media.title}`);
            } // end media loop
        }

        // 3. Seed Bible Stories
        const storiesCount = 10;
        for (let i = 0; i < storiesCount; i++) {
            await BibleRepository.createStory({
                title: faker.lorem.words(3),
                description: faker.lorem.paragraph(),
                scriptureReference: `${faker.helpers.arrayElement(['Genesis', 'Exodus', 'John', 'Acts'])} ${faker.number.int({ min: 1, max: 20 })}`,
                content: faker.lorem.paragraphs(2),
                imageUrl: faker.image.urlPicsumPhotos(),
            });
        }

        // 4. Seed Bible Verses (Daily verses)
        let bibleVerses = [];
        try {
            const verseData = await import("./bible-verses.json", { assert: { type: "json" } });
            bibleVerses = verseData.default;
        } catch (e) {
            console.log("⚠️ Could not load bible-verses.json, using faker instead.");
        }

        if (bibleVerses.length > 0) {
            for (const verse of bibleVerses) {
                await BibleRepository.createVerse({
                    text: verse.text,
                    passage: verse.passage,
                    isDaily: verse.isDaily || false,
                    version: verse.version || 'KJV'
                });
            }
        } else {
            for (let i = 0; i < 10; i++) {
                await BibleRepository.createVerse({
                    text: `${faker.lorem.sentence()} - ${faker.person.firstName()}`,
                    passage: `${faker.helpers.arrayElement(['Psalms', 'Proverbs', 'Matthew'])} ${faker.number.int({ min: 1, max: 150 })}:${faker.number.int({ min: 1, max: 20 })}`,
                    isDaily: true,
                });
            }
        }

        console.log("✅ Content seeded successfully.");
    } catch (error) {
        console.error("❌ Error seeding content:", error);
    }
};


// Standalone execution support
import { connectMongoDB } from '../Config/mongodb.js';
import { connectDB } from '../Config/db.js';
import "../env.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

if (entryFile === __filename || entryFile?.endsWith('04-contentSeeder.js')) {
    (async () => {
        try {
            if (process.env.DB_CONNECTION === 'mongodb') {
                await connectMongoDB();
            } else {
                await connectDB();
            }
            await seedContent();
            process.exit(0);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    })();
}

export default seedContent;
