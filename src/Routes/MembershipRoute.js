// MembershipRoute.js
import express from "express";
import MembershipController from "../Controllers/MembershipController.js";

const router = express.Router();
router.post('/create', MembershipController.registerMembership.bind(MembershipController));
router.get('/', MembershipController.getMemberships.bind(MembershipController));

export default router;