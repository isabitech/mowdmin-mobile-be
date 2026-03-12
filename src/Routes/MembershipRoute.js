// MembershipRoute.js
import express from "express";
import MembershipController from "../Controllers/MembershipController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const router = express.Router();
router.post('/create', protectUser, tryCatch(MembershipController.registerMembership.bind(MembershipController)));
router.get('/', protectUser, tryCatch(MembershipController.getMemberships.bind(MembershipController)));

export default router;