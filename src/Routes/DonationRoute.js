// DonationRoute.js
import { Router } from 'express';
import DonationController from '../Controllers/DonationController.js';
import { protectUser, protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/create', protectUser, DonationController.create);
router.get('/', protectUser, protectAdmin, DonationController.getDonations);

export default router;