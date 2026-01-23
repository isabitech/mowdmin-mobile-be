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
import authRoutes from '../Routes/AuthRoute.js';
import AuthService from '../Services/AuthService.js';

jest.mock('../Services/AuthService.js');

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
        const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
        AuthService.register.mockResolvedValue({ user: mockUser, token: 'fake-token' });

        const response = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                language: 'EN'
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
    });

    it('should login successfully', async () => {
        AuthService.login.mockResolvedValue({ user: { id: 1 }, token: 'fake-token' });

        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'test@example.com', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });
});
