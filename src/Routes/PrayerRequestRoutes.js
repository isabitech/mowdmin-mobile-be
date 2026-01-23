import express from "express";
import PrayerRequestController from "../Controllers/PrayerRequestController.js";
import {
  validatePrayerRequestCreate,
  validatePrayerRequestUpdate,
} from "../middleware/Validation/PrayerRequestValidation.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";
const PrayerRequest = express.Router();

// Create new prayer request
PrayerRequest.post("/", protectUser, validatePrayerRequestCreate, tryCatch(PrayerRequestController.create));

// Get all public prayer requests
PrayerRequest.get("/", protectUser, tryCatch(PrayerRequestController.getAll));

// Get all requests by logged-in user
PrayerRequest.get("/me", protectUser, tryCatch(PrayerRequestController.getAllByUser));

// Get a single prayer request
PrayerRequest.get("/:id", protectUser, tryCatch(PrayerRequestController.getSingle));

// Update prayer request
PrayerRequest.put("/:id", protectUser, validatePrayerRequestUpdate, tryCatch(PrayerRequestController.update));

// Delete prayer request
PrayerRequest.delete("/:id", protectUser, tryCatch(PrayerRequestController.delete));

export default PrayerRequest;
