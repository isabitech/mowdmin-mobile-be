import { Router } from "express";
import PrayerCommentController from "../Controllers/PrayerCommentController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const router = Router();

router.post("/:id/comment", protectUser, tryCatch(PrayerCommentController.comment));

export default router;
