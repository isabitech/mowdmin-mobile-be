import { Router } from "express";
import BibleController from "../Controllers/BibleController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const bibleStoryRouter = Router();

// Bible Stories
bibleStoryRouter.get("/", protectUser, tryCatch(BibleController.getAllStories));
bibleStoryRouter.post("/", protectUser, protectAdmin, tryCatch(BibleController.createStory));

const bibleVerseRouter = Router();

// Bible Verses
bibleVerseRouter.get("/", protectUser, tryCatch(BibleController.getAllVerses));
bibleVerseRouter.get("/daily", protectUser, tryCatch(BibleController.getDailyVerse));
bibleVerseRouter.post("/", protectUser, protectAdmin, tryCatch(BibleController.createVerse));

export { bibleStoryRouter, bibleVerseRouter };
