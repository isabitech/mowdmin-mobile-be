// DonationRoute.js
import { Router } from 'express';
import DonationController from '../Controllers/DonationController.js';
import { protectUser, protectAdmin } from '../middleware/authMiddleware.js';
import { tryCatch } from '../Utils/try-catch.js';

const router = Router();

// Public / Semi-public routes
router.post('/', protectUser, tryCatch(DonationController.create.bind(DonationController)));
router.get('/', protectUser, protectAdmin, tryCatch(DonationController.getAll.bind(DonationController)));
router.get('/:id', protectUser, tryCatch(DonationController.getOne.bind(DonationController)));

// Pay for a donation (creates a Stripe PaymentIntent)
router.post('/:id/pay', protectUser, tryCatch(DonationController.payForDonation.bind(DonationController)));

// Specific action routes
router.patch('/:id/status', protectUser, protectAdmin, tryCatch(DonationController.updateStatus.bind(DonationController)));
router.get('/campaign/:campaignId', protectUser, tryCatch(DonationController.getByCampaign.bind(DonationController)));

export default router;