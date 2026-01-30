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
import authRoutes from '../Routes/AuthRoute.js';
import AuthService from '../Services/AuthService.js';

jest.mock('../Services/AuthService.js');
jest.mock('../Services/SocialAuthService.js', () => ({
    authenticateWithGoogle: jest.fn(),
    authenticateWithApple: jest.fn(),
}));

import SocialAuthService from '../Services/SocialAuthService.js';

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

    it('should verify OTP successfully', async () => {
        AuthService.verifyEmail.mockResolvedValue(true);
        const response = await request(app)
            .post('/api/v1/auth/verify-otp')
            .send({ email: 'test@example.com', otp: '123456' });
        expect(response.status).toBe(200);
    });

    it('should resend OTP successfully', async () => {
        AuthService.resendEmailVerification.mockResolvedValue(true);
        const response = await request(app)
            .post('/api/v1/auth/resend-otp')
            .send({ email: 'test@example.com' });
        expect(response.status).toBe(200);
    });

    it('should authenticate with Google successfully', async () => {
        const mockUser = { id: 1, email: 'google@example.com', name: 'Google User' };
        const mockToken = 'mock-jwt-token';

        SocialAuthService.authenticateWithGoogle.mockResolvedValue({
            user: mockUser,
            token: mockToken
        });

        const response = await request(app)
            .post('/api/v1/auth/google')
            .send({ idToken: 'valid-google-id-token' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toEqual({
            user: mockUser,
            token: mockToken
        });
        expect(SocialAuthService.authenticateWithGoogle).toHaveBeenCalledWith('valid-google-id-token');
    });
});
