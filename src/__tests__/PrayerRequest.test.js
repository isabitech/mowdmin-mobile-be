// MUST BE AT TOP
jest.mock('express-validator', () => ({
    validationResult: () => ({
        isEmpty: () => true,
        array: () => [],
    }),
}));

jest.mock('nodemailer', () => ({
    createTransport: () => ({
        sendMail: () => Promise.resolve(true),
    }),
}));

import request from 'supertest';
import express from 'express';
import prayerRequestRoutes from '../Routes/PrayerRequestRoute.js';
import PrayerRequestService from '../Services/PrayerRequestService.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/PrayerRequestService.js');
jest.mock('../middleware/authMiddleware.js');

const app = express();
app.use(express.json());
app.use('/api/v1/prayer-request', prayerRequestRoutes);

describe('Prayer Request Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        protectUser.mockImplementation((req, res, next) => {
            req.user = { id: 1 };
            next();
        });
    });

    it('should create a prayer request successfully', async () => {
        PrayerRequestService.createPrayerRequest.mockResolvedValue({ id: 1 });
        const response = await request(app)
            .post('/api/v1/prayer-request/create')
            .send({ request: 'Please pray for my family' });
        expect(response.status).toBe(201);
    });
});
