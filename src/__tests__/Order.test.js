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
import orderRoutes from '../Routes/OrderRoute.js';
import OrderService from '../Services/OrderService.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/OrderService.js');
jest.mock('../middleware/authMiddleware.js');

const app = express();
app.use(express.json());
app.use('/api/v1/orders', orderRoutes);

describe('Order Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        protectUser.mockImplementation((req, res, next) => {
            req.user = { id: 1 };
            next();
        });
    });

    it('should create an order successfully', async () => {
        OrderService.createOrder.mockResolvedValue({ id: 1 });
        const response = await request(app)
            .post('/api/v1/orders/create')
            .send({ items: [{ productId: 1, quantity: 1 }] });
        expect(response.status).toBe(201);
    });
});
