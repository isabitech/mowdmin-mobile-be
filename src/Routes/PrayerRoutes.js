import express from "express";
import PrayerController from "../Controllers/PrayerController.js";
import { validatePrayerCreate } from "../middleware/Validation/PrayerValidation.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const Prayer = express.Router();

// Create new prayer (user prays for a request)
Prayer.post("/", protectUser, validatePrayerCreate, tryCatch(PrayerController.create));

// Get all prayers
Prayer.get("/", protectUser, tryCatch(PrayerController.getAll));

// Get all prayers by user
Prayer.get("/me", protectUser, tryCatch(PrayerController.getAllByUser));

// Get single prayer
Prayer.get("/:id", protectUser, tryCatch(PrayerController.getSingle));

// Delete prayer
Prayer.delete("/:id", protectUser, tryCatch(PrayerController.delete));

export default Prayer;
