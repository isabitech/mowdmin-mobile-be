import { Router } from "express";
import CampaignController from "../Controllers/CampaignController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const router = Router();

// Public routes (or replace with protectUser if needed)
router.get("/", tryCatch(CampaignController.getAll));
router.get("/:id", tryCatch(CampaignController.getOne));

// Protected routes (admin only typically for creating/updating/deleting campaigns)
router.post("/", protectUser, protectAdmin, tryCatch(CampaignController.create));
router.put("/:id", protectUser, protectAdmin, tryCatch(CampaignController.update));
router.delete("/:id", protectUser, protectAdmin, tryCatch(CampaignController.delete));

export default router;
