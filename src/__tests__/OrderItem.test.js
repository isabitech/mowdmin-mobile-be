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
import orderItemRoutes from '../Routes/OrderItemRoute.js';
import OrderItemService from '../Services/OrderItemService.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/OrderItemService.js');
jest.mock('../middleware/authMiddleware.js');

const app = express();
app.use(express.json());
app.use('/api/v1/order-item', orderItemRoutes);

describe('Order Item Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        protectUser.mockImplementation((req, res, next) => { next(); });
    });

    it('should fetch order items successfully', async () => {
        OrderItemService.getByOrderId.mockResolvedValue([]);
        const response = await request(app).get('/api/v1/order-item/order/1');
        expect(response.status).toBe(200);
    });
});
