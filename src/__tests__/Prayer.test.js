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
import prayerRoutes from '../Routes/PrayerRoute.js';
import PrayerService from '../Services/PrayerService.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/PrayerService.js');
jest.mock('../middleware/authMiddleware.js');

const app = express();
app.use(express.json());
app.use('/api/v1/prayer', prayerRoutes);

describe('Prayer Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        protectUser.mockImplementation((req, res, next) => { next(); });
    });

    it('should create a prayer successfully', async () => {
        PrayerService.createPrayer.mockResolvedValue({ id: 1 });
        const response = await request(app)
            .post('/api/v1/prayer/create')
            .send({ title: 'Morning Prayer', content: '...' });
        expect(response.status).toBe(201);
    });
});
