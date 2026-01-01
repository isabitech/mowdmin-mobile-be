import { Router } from "express";
import PrayerRequestController from "../Controllers/PrayerRequestController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { validateCreatePrayerRequest, validateUpdatePrayerRequest } from "../validators/prayerRequestValidators.js";
import { tryCatch } from "../Utils/try-catch.js";
const prayerRequest = Router();

prayerRequest.post(
	"/",
	protectUser,
	validateCreatePrayerRequest,
		
	tryCatch(PrayerRequestController.create)
);
prayerRequest.get("/", protectUser, tryCatch(PrayerRequestController.getAll));
prayerRequest.get("/user", protectUser, tryCatch(PrayerRequestController.getAllByUser));
prayerRequest.get("/:id", protectUser, tryCatch(PrayerRequestController.getSingle));
prayerRequest.put(
	"/:id",
	protectUser,
	validateUpdatePrayerRequest,
	tryCatch(PrayerRequestController.update)
);
prayerRequest.delete("/:id", protectUser, tryCatch(PrayerRequestController.delete));

export default prayerRequest;
