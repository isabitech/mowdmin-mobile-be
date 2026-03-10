// ProfileRoute.js
import express from "express";
import { ProfileController } from "../Controllers/ProfileController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import upload from "../Config/multer.js";
import { validateProfileUpdate } from "../middleware/Validation/profileValidation.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";
import { tryCatch } from "../Utils/try-catch.js";

const router = express.Router();
router.get('/', protectUser, tryCatch(ProfileController.getProfile));
router.put(
	'/',
	protectUser,
	upload.single('photo'),
	validateProfileUpdate,
	handleValidationErrors,
	tryCatch(ProfileController.updateProfile)
);

export default router;