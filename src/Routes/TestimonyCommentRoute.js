import { Router } from "express";
import TestimonyCommentController from "../Controllers/TestimonyCommentController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const router = Router();

router.get(
  "/:testimonyId/comments",
  protectUser,
  tryCatch(TestimonyCommentController.getComments),
);
router.post(
  "/:testimonyId/comment",
  protectUser,
  tryCatch(TestimonyCommentController.addComment),
);
router.delete(
  "/:commentId",
  protectUser,
  tryCatch(TestimonyCommentController.deleteComment),
);

export default router;
