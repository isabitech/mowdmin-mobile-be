import { Router } from "express";
import PrayerLikeController from "../Controllers/PrayerLikeController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const router = Router();

router.post("/:id/like", protectUser, tryCatch(PrayerLikeController.like));
router.get("/my-likes", protectUser, tryCatch(PrayerLikeController.getUserLikes));
router.post("/:id/unlike", protectUser, tryCatch(PrayerLikeController.unlike)); // Toggle like/unlike

export default router;
