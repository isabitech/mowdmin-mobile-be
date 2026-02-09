// DonationRoute.js
import { Router } from 'express';
import DonationController from '../Controllers/DonationController.js';
import { protectUser, protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Use tryCatch for all controller methods for better error handling
import { tryCatch } from '../Utils/try-catch.js';

router.post('/create', protectUser, tryCatch(DonationController.create.bind(DonationController)));
router.get('/user', protectUser, tryCatch(DonationController.getDonationsByUser.bind(DonationController)));
router.get('/:id', protectUser, tryCatch(DonationController.getDonationById.bind(DonationController)));
router.get('/', protectUser, protectAdmin, tryCatch(DonationController.getDonations.bind(DonationController)));

export default router;