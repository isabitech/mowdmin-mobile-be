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
import membershipRoutes from '../Routes/MembershipRoute.js';
import MembershipService from '../Services/MembershipService.js';

jest.mock('../Services/MembershipService.js');

const app = express();
app.use(express.json());
app.use('/api/v1/membership', membershipRoutes);

describe('Membership Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create membership successfully', async () => {
        const mockMembership = { id: 1, type: 'basic' };
        MembershipService.createMembership.mockResolvedValue(mockMembership);

        const response = await request(app)
            .post('/api/v1/membership/create')
            .send({ type: 'basic', price: 10 });

        expect(response.status).toBe(201);
    });
});
