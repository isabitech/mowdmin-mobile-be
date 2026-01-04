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
import mediaRoutes from '../Routes/MediaRoute.js';
import MediaService from '../Services/MediaService.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/MediaService.js');
jest.mock('../middleware/authMiddleware.js');

const app = express();
app.use(express.json());
app.use('/api/v1/media', mediaRoutes);

describe('Media Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        protectUser.mockImplementation((req, res, next) => { next(); });
    });

    it('should create media successfully', async () => {
        const mockMedia = { id: 1, title: 'Test Audio' };
        MediaService.createMedia.mockResolvedValue(mockMedia);

        const response = await request(app)
            .post('/api/v1/media/create')
            .send({ title: 'Test Audio', categoryId: 1, type: 'audio' });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
    });
});
