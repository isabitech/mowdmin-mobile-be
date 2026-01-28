import { Router } from "express";
import PrayerRequestController from "../Controllers/PrayerRequestController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { middlewareValidateCreatePrayerRequest, middlewareValidateUpdatePrayerRequest } from "../middleware/Validation/PrayerRequestValidation.js";
import { tryCatch } from "../Utils/try-catch.js";
const prayerRequest = Router();

prayerRequest.post(
	"/create",
	protectUser,
	middlewareValidateCreatePrayerRequest,

	tryCatch(PrayerRequestController.create)
);
prayerRequest.get("/", protectUser, tryCatch(PrayerRequestController.getAll));
prayerRequest.get("/user", protectUser, tryCatch(PrayerRequestController.getAllByUser));
prayerRequest.get("/:id", protectUser, tryCatch(PrayerRequestController.getSingle));
prayerRequest.put(
	"/:id",
	protectUser,
	middlewareValidateUpdatePrayerRequest,
	tryCatch(PrayerRequestController.update)
);
prayerRequest.delete("/:id", protectUser, tryCatch(PrayerRequestController.delete));

export default prayerRequest;
