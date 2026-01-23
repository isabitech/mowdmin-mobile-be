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
import eventRoutes from '../Routes/EventRoute.js';
import EventService from '../Services/EventService.js';

jest.mock('../Services/EventService.js');

const app = express();
app.use(express.json());
app.use('/api/v1/event', eventRoutes);

describe('Event Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/event/create', () => {
        it('should create an event successfully', async () => {
            const mockEvent = { id: 1, title: 'Test Event' };
            EventService.createEvent.mockResolvedValue(mockEvent);

            const response = await request(app)
                .post('/api/v1/event/create')
                .send({ title: 'Test Event', date: '2023-12-01', time: '10:00 AM' });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data).toEqual(mockEvent);
        });
    });

    describe('GET /api/v1/event', () => {
        it('should fetch all events successfully', async () => {
            const mockEvents = [{ id: 1, title: 'Test Event' }];
            EventService.getAllEvents.mockResolvedValue(mockEvents);

            const response = await request(app).get('/api/v1/event');

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockEvents);
        });
    });
});
