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
import productRoutes from '../Routes/ProductRoute.js';
import ProductService from '../Services/ProductService.js';
import { protectUser } from '../middleware/authMiddleware.js';

jest.mock('../Services/ProductService.js');
jest.mock('../middleware/authMiddleware.js', () => ({
    protectUser: jest.fn((req, res, next) => {
        req.user = { id: 1 };
        next();
    }),
    protectAdmin: jest.fn((req, res, next) => next()),
}));

jest.mock('../Config/db.js', () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue({
        define: jest.fn().mockReturnValue({
            hasMany: jest.fn(),
            belongsTo: jest.fn(),
            hasOne: jest.fn(),
        }),
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

const app = express();
app.use(express.json());
app.use('/api/v1/product', productRoutes);

describe('Product Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a product successfully', async () => {
        ProductService.createProduct.mockResolvedValue({ id: 1 });
        const response = await request(app)
            .post('/api/v1/product/create')
            .send({ name: 'Bible', price: 20, categoryId: '1' });
        expect(response.status).toBe(201);
    });
});
