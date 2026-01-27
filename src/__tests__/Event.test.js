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
import eventRoutes from '../Routes/EventRoute.js';
import EventService from '../Services/EventService.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/EventService.js');
jest.mock('../middleware/authMiddleware.js');

const app = express();
app.use(express.json());
app.use('/api/v1/event', eventRoutes);

describe('Event Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        protectUser.mockImplementation((req, res, next) => { next(); });
    });

    describe('POST /api/v1/event/create', () => {
        it('should create an event successfully', async () => {
            const mockEvent = { id: 1, title: 'Test Event' };
            EventService.createEvent.mockResolvedValue(mockEvent);

            const response = await request(app)
                .post('/api/v1/event/create')
                .send({ title: 'Test Event', date: '2023-12-01', time: '10:00 AM', location: 'Test Location', type: 'concert' });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data).toMatchObject({
                id: 1,
                title: 'Test Event',
                image: null,
            });
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
