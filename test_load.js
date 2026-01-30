import { protectUser } from './src/middleware/authMiddleware.js';
console.log('protectUser loaded successfully:', !!protectUser);
process.exit(0);
