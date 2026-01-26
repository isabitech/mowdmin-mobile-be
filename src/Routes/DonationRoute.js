// DonationRoute.js
import { Router } from 'express';
import DonationController from '../Controllers/DonationController.js';

const router = Router();
router.post('/create', DonationController.create);
router.get('/', DonationController.getDonations);

export default router;