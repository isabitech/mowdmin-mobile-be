
// Mock dependencies
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

// Mock nodemailer to avoid sending real emails
jest.mock('nodemailer', () => ({
    createTransport: () => ({
        sendMail: () => Promise.resolve(true),
    }),
}));

import request from 'supertest';
import express from 'express';
import authRoutes from '../Routes/AuthRoute.js';
import AuthService from '../Services/AuthService.js';
import { AuthRepository } from '../repositories/AuthRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { globalErrorHandler } from '../core/error.js';

// Setup Express App
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use(globalErrorHandler);

// Mock Data
const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    toJSON: () => ({ id: 'user-123', email: 'test@example.com', name: 'Test User' })
};

// Mock Repositories
jest.mock('../repositories/UserRepository.js');
jest.mock('../repositories/AuthRepository.js');

describe('Refresh Token Rotation & Reuse Detection', () => {
    let initialRefreshToken;
    let initialSession;
    let newSession;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';

        // Mock User Find
        UserRepository.findById.mockResolvedValue(mockUser);
        UserRepository.findByEmail.mockResolvedValue(mockUser);
    });

    test('SCENARIO 1: Normal Refresh Flow (Rotation)', async () => {
        // 1. Setup Initial State
        initialRefreshToken = jwt.sign({ id: mockUser.id, type: 'refresh' }, process.env.JWT_SECRET);
        const tokenHash = crypto.createHash('sha256').update(initialRefreshToken).digest('hex');

        initialSession = {
            userId: mockUser.id,
            tokenHash: 'old-access-hash',
            refreshTokenHash: tokenHash,
            refreshTokenExpiresAt: new Date(Date.now() + 10000),
            isLoggedOut: false,
            replacedBy: null, // Not replaced yet
            updateOne: jest.fn().mockImplementation(function (update) {
                Object.assign(this, update); // Simulate update
                return Promise.resolve(this);
            })
        };

        // Mock AuthRepository to return this session
        AuthRepository.findByTokenHash.mockResolvedValue(initialSession);

        // Mock Create for new session
        AuthRepository.create.mockImplementation(async (data) => {
            newSession = { ...data, _id: 'session-456' }; // New Session ID
            return newSession;
        });

        // 2. Perform Refresh Request
        const response = await request(app)
            .post('/api/v1/auth/refresh')
            .send({ refreshToken: initialRefreshToken });

        // 3. Verify Response
        expect(response.status).toBe(200);
        expect(response.body.data.refreshToken).toBeDefined();
        expect(response.body.data.refreshToken).not.toBe(initialRefreshToken); // Must be new

        // 4. Verify Rotation Logic (Old Session Updated)
        expect(initialSession.updateOne).toHaveBeenCalled();
        expect(initialSession.isLoggedOut).toBe(true);
        expect(initialSession.replacedBy).toBe('session-456');
    });

    test('SCENARIO 2: Token Reuse Attack Detection', async () => {
        // 1. Setup "Compromised/Old" Session State
        // This simulates that the token was ALREADY rotated, so it has a replacedBy value
        const usedToken = jwt.sign({ id: mockUser.id, type: 'refresh' }, process.env.JWT_SECRET);
        const tokenHash = crypto.createHash('sha256').update(usedToken).digest('hex');

        const compromisedSession = {
            userId: mockUser.id,
            tokenHash: 'old-access-hash',
            refreshTokenHash: tokenHash,
            refreshTokenExpiresAt: new Date(Date.now() + 10000),
            isLoggedOut: true, // It was logged out during rotation
            replacedBy: 'session-789', // 🚨 Critical: Checks if this exists
            updateOne: jest.fn()
        };

        AuthRepository.findByTokenHash.mockResolvedValue(compromisedSession);
        AuthRepository.revokeAllUserTokens.mockResolvedValue(true);

        // 2. Attacker tries to use the OLD token again
        const response = await request(app)
            .post('/api/v1/auth/refresh')
            .send({ refreshToken: usedToken });

        // 3. Verify Security Response
        console.log('DEBUG RESPONSE BODY:', JSON.stringify(response.body, null, 2));
        throw new Error('FORCE FAIL TO SEE LOGS');
        expect(response.status).toBe(403); // Forbidden
        expect(response.body.message).toMatch(/Suspicious activity detected/); // User warning

        // 4. Verify Defensive Action (Revoke All)
        expect(AuthRepository.revokeAllUserTokens).toHaveBeenCalledWith(mockUser.id);
    });
});
