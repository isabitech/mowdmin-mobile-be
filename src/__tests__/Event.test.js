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

jest.mock('../middleware/authMiddleware.js', () => ({
    protectUser: jest.fn((req, res, next) => {
        req.user = { id: 1 };
        next();
    }),
    protectAdmin: jest.fn((req, res, next) => {
        next();
    }),
}));

jest.mock('../Config/db.js', () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue({
        define: jest.fn().mockReturnValue({
            hasMany: jest.fn(),
            belongsTo: jest.fn(),
            hasOne: jest.fn(),
            toJSON: jest.fn().mockReturnValue({}),
        }),
        authenticate: jest.fn().mockResolvedValue(true),
    }),
    connectDB: jest.fn().mockResolvedValue(true),
}));

jest.mock('../Config/mongodb.js', () => ({
    connectMongoDB: jest.fn().mockResolvedValue(true),
}));

jest.mock('../Config/redis.js', () => ({
    initializeRedis: jest.fn().mockResolvedValue(true),
    getRedisClient: jest.fn().mockResolvedValue({}),
    isRedisAvailable: jest.fn().mockReturnValue(true),
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
            const mockEvent = { id: 1, title: 'Test Event', toJSON: () => ({ id: 1, title: 'Test Event' }) };
            EventService.createEvent.mockResolvedValue(mockEvent);

            const response = await request(app)
                .post('/api/v1/event/create')
                .send({ title: 'Test Event', date: '2023-12-01', time: '10:00 AM', location: 'Test Location', type: 'concert' });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
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
