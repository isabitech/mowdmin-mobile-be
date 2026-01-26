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
import infoRoutes from '../Routes/InfoRoute.js';
import InfoService from '../Services/InfoService.js';

jest.mock('../Services/InfoService.js');

const app = express();
app.use(express.json());
app.use('/api/v1/info', infoRoutes);

describe('Info Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/info', () => {
        it('should fetch all info entries successfully', async () => {
            const mockInfo = {
                mission: 'Test mission',
                impact: ['Impact 1'],
                media: [],
            };
            InfoService.getAllInfo.mockResolvedValue(mockInfo);

            const response = await request(app).get('/api/v1/info');

            expect(response.status).toBe(200);
            expect(response.body.data).toMatchObject(mockInfo);
        });
    });
});
