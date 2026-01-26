// MUST BE AT TOP
jest.mock('express-validator', () => {
    const middleware = (req, res, next) => next();
    const chain = () => new Proxy(middleware, {
        get: (target, prop) => {
            if (prop === 'then') return undefined;
            return chain;
        }
    });
    return {
        body: chain,
        param: chain,
        query: chain,
        validationResult: () => ({
            isEmpty: () => true,
            array: () => [],
        }),
    };
});

jest.mock('nodemailer', () => ({
    createTransport: () => ({
        sendMail: () => Promise.resolve(true),
    }),
}));

import request from 'supertest';
import express from 'express';
import donationRoutes from '../Routes/DonationRoute.js';
import DonationService from '../Services/DonationService.js';

jest.mock('../Services/DonationService.js');

const app = express();
app.use(express.json());
app.use('/api/v1/donation', donationRoutes);

describe('Donation Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/donation/create', () => {
        it('should create a donation successfully', async () => {
            const mockDonation = { id: 1, amount: 100, donorName: 'John Doe' };
            DonationService.createDonation.mockResolvedValue(mockDonation);

            const response = await request(app)
                .post('/api/v1/donation/create')
                .send({ amount: 100, donorName: 'John Doe' });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data).toEqual(mockDonation);
        });
    });

    describe('GET /api/v1/donation', () => {
        it('should fetch all donations successfully', async () => {
            const mockDonations = [{ id: 1, amount: 100 }];
            DonationService.getAllDonations.mockResolvedValue(mockDonations);

            const response = await request(app).get('/api/v1/donation');

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockDonations);
        });
    });
});
