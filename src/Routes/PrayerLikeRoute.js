import { Router } from "express";
import PrayerLikeController from "../Controllers/PrayerLikeController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const router = Router();

router.post("/:id/like", protectUser, tryCatch(PrayerLikeController.like));

export default router;
