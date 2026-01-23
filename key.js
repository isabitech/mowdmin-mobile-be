const crypto = require('crypto');

// Generate a 32-byte (256-bit) secret key
const secretKey = crypto.randomBytes(32).toString('hex');

// Store this in your environment variables (.env file)
// JWT_SECRET=your_generated_secret_here
console.log('Generated JWT Secret:', secretKey);
