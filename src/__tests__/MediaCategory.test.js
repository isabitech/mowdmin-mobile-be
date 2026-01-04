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
import mediaCategoryRoutes from '../Routes/MediaCategoryRoute.js';
import MediaCategoryService from '../Services/MediaCategoryService.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/MediaCategoryService.js');
jest.mock('../middleware/authMiddleware.js');

const app = express();
app.use(express.json());
app.use('/api/v1/media-category', mediaCategoryRoutes);

describe('Media Category Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        protectUser.mockImplementation((req, res, next) => { next(); });
    });

    it('should create a media category successfully', async () => {
        const mockCategory = { id: 1, name: 'Sermons' };
        MediaCategoryService.createCategory.mockResolvedValue(mockCategory);

        const response = await request(app)
            .post('/api/v1/media-category/create')
            .send({ name: 'Sermons', description: 'Weekly sermons' });

        expect(response.status).toBe(201);
    });
});
