
import request from 'supertest';
import express from 'express';
import eventRegistrationRoutes from '../Routes/EventRegistrationRoute.js';
import { errorHandler } from '../middleware/errorHandler.js';

// Mock authentication middleware since we just want to test JSON parsing
jest.mock('../middleware/authMiddleware.js', () => ({
    protectUser: (req, res, next) => {
        req.user = { id: '550e8400-e29b-41d4-a716-446655440000' };
        next();
    },
    protectAdmin: (req, res, next) => next(),
}));

// Mock validation to bypass it for this test
jest.mock('../middleware/Validation/eventRegistrationValidation.js', () => ({
    validateEventRegistration: (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api/v1/event-registration', eventRegistrationRoutes);
app.use(errorHandler);

describe('JSON Parsing Error Handling', () => {
    it('should return a 400 error for malformed JSON with a trailing comma', async () => {
        const malformedJson = '{"eventId": "698dcf4d30653c2bdb2bfce5",}';

        const response = await request(app)
            .post('/api/v1/event-registration/register')
            .set('Content-Type', 'application/json')
            .send(malformedJson);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Invalid JSON format');
    });

    it('should return 200 for valid JSON (sanity check)', async () => {
        // We need to mock the service for this to work
        const { default: EventRegistrationService } = await import('../Services/EventRegistration.js');
        jest.spyOn(EventRegistrationService, 'createEventReg').mockResolvedValue({ id: '123' });

        const validJson = { eventId: '698dcf4d30653c2bdb2bfce5' };

        const response = await request(app)
            .post('/api/v1/event-registration/register')
            .send(validJson);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });
});
