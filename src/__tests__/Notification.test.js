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
import notificationRoutes from '../Routes/NotificationRoute.js';
import NotificationService from '../Services/NotificationService.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/NotificationService.js');
jest.mock('../middleware/authMiddleware.js');

const app = express();
app.use(express.json());
app.use('/api/v1/notification', notificationRoutes);

describe('Notification Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        protectUser.mockImplementation((req, res, next) => {
            req.user = { id: 1 };
            next();
        });
    });

    it('should fetch user notifications successfully', async () => {
        NotificationService.getUserNotifications.mockResolvedValue([]);
        const response = await request(app).get('/api/v1/notification');
        expect(response.status).toBe(200);
    });
});
