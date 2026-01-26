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
import paymentRoutes from '../Routes/PaymentRoute.js';
import PaymentService from '../Services/PaymentService.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/PaymentService.js');
jest.mock('../middleware/authMiddleware.js');

const app = express();
app.use(express.json());
app.use('/api/v1/payment', paymentRoutes);

describe('Payment Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        protectUser.mockImplementation((req, res, next) => {
            req.user = { id: 1 };
            next();
        });
    });

    it('should create a payment successfully', async () => {
        PaymentService.createPayment.mockResolvedValue({ id: 1 });
        const response = await request(app)
            .post('/api/v1/payment/create')
            .send({
                orderId: '1',
                amount: 100,
                method: 'stripe',
                status: 'pending'
            });
        expect(response.status).toBe(201);
    });
});
