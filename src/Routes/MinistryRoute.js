import { Router } from "express";
import MinistryController from "../Controllers/MinistryController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const router = Router();

router.get("/", protectUser, tryCatch(MinistryController.getAllMinistries));
router.get("/:id", protectUser, tryCatch(MinistryController.getMinistryById));
router.post("/", protectUser, protectAdmin, tryCatch(MinistryController.createMinistry));

export default router;
