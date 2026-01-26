import { Router } from "express";
import PrayerController from "../Controllers/PrayerController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { middlewareValidateCreatePrayer } from "../validators/prayerValidators.js";
import { tryCatch } from "../Utils/try-catch.js";

const prayer = Router();

prayer.post(
	"/create",
	protectUser,
	middlewareValidateCreatePrayer,
	tryCatch(PrayerController.create)
);
prayer.get("/", protectUser, tryCatch(PrayerController.getAll));
prayer.get("/user", protectUser, tryCatch(PrayerController.getAllByUser));
prayer.get("/:id", protectUser, tryCatch(PrayerController.getSingle));
prayer.delete("/:id", protectUser, tryCatch(PrayerController.delete));

export default prayer;
