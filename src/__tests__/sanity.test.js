import { protectUser } from '../middleware/authMiddleware.js';

describe('Sanity Check', () => {
    it('should pass', () => {
        expect(1 + 1).toBe(2);
        expect(protectUser).toBeDefined();
    });
});
