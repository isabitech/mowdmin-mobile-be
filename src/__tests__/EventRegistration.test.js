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
import eventRegistrationRoutes from '../Routes/EventRegistrationRoute.js';
import EventRegistrationService from '../Services/EventRegistration.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/EventRegistration.js');
jest.mock('../middleware/authMiddleware.js');

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

const app = express();
app.use(express.json());
app.use('/api/v1/event-registration', eventRegistrationRoutes);

describe('Event Registration Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        protectUser.mockImplementation((req, res, next) => {
            req.user = { id: validUUID };
            next();
        });
    });

    it('should register for an event successfully', async () => {
        const mockReg = { id: validUUID, eventId: validUUID, userId: validUUID };
        EventRegistrationService.createEventReg.mockResolvedValue(mockReg);

        const response = await request(app)
            .post('/api/v1/event-registration/register')
            .send({ eventId: validUUID, userId: validUUID });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });
});
