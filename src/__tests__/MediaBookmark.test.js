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
import mediaBookmarkRoutes from '../Routes/MediaBookmarkRoute.js';
import MediaBookmarkService from '../Services/MediaBookmarkService.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/MediaBookmarkService.js');
jest.mock('../middleware/authMiddleware.js');

const app = express();
app.use(express.json());
app.use('/api/v1/media-bookmark', mediaBookmarkRoutes);

describe('Media Bookmark Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        protectUser.mockImplementation((req, res, next) => {
            req.user = { id: 1 };
            next();
        });
    });

    it('should bookmark media successfully', async () => {
        MediaBookmarkService.createMediaBookmark.mockResolvedValue({ id: 1 });

        const response = await request(app)
            .post('/api/v1/media-bookmark/create')
            .send({ mediaId: '1' });

        expect(response.status).toBe(201);
    });
});
