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
            const mockInfo = [{ id: 1, content: 'Test Info' }];
            InfoService.getAllInfo.mockResolvedValue(mockInfo);

            const response = await request(app).get('/api/v1/info');

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockInfo);
        });
    });
});
