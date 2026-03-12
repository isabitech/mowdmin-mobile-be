import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisAvailable } from '../Config/redis.js';

// Build a Redis store if Redis is available
const getStore = async (prefix) => {
    if (!isRedisAvailable()) return undefined; // falls back to in-memory
    const client = await getRedisClient();
    if (!client) return undefined;
    return new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: `rl:${prefix}:`,
    });
};

// Initialize stores asynchronously
let authStore, otpStore, apiStore, passwordResetStore;
(async () => {
    try {
        authStore = await getStore('auth');
        otpStore = await getStore('otp');
        apiStore = await getStore('api');
        passwordResetStore = await getStore('pwreset');
    } catch (err) {
        // Redis not available — will use in-memory stores
    }
})();

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    get store() { return authStore; },
});

// Rate limiter for OTP verification (stricter)
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 attempts per window
    message: 'Too many verification attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    get store() { return otpStore; },
});

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests from this IP, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
    get store() { return apiStore; },
});

// Password reset rate limiter (prevent abuse)
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset requests per hour
    message: 'Too many password reset requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    get store() { return passwordResetStore; },
});
