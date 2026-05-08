import { Router } from "express";
import TestimonyLikeController from "../Controllers/TestimonyLikeController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const router = Router();

router.post(
  "/:testimonyId/like",
  protectUser,
  tryCatch(TestimonyLikeController.toggleLike),
);

export default router;
