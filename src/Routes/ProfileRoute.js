// ProfileRoute.js
import express from "express";
import { ProfileController } from "../Controllers/ProfileController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get('/', protectUser, ProfileController.getProfile);
router.put('/', protectUser, ProfileController.updateProfile);

export default router;