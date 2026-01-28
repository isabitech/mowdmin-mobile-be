import { Router } from "express";
import PrayerController from "../Controllers/PrayerController.js";
import { protectAdmin, protectUser } from "../middleware/authMiddleware.js";
import { validatePrayerCreate } from "../middleware/Validation/PrayerValidation.js";
import { tryCatch } from "../Utils/try-catch.js";

const prayer = Router();

prayer.post(
	"/create",
	protectUser,
	protectAdmin,
	validatePrayerCreate,
	tryCatch(PrayerController.create)
);
prayer.get("/", protectUser, tryCatch(PrayerController.getAll));
prayer.get("/user", protectUser, tryCatch(PrayerController.getAllByUser));
prayer.get("/:id", protectUser, tryCatch(PrayerController.getSingle));
prayer.delete("/:id", protectUser, protectAdmin, tryCatch(PrayerController.delete));

export default prayer;
