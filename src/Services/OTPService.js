import { getRedisClient, isRedisAvailable } from '../Config/redis.js';

// In-memory fallback when Redis is unavailable
const memoryStore = new Map();

class OTPService {
    
    static generate4DigitOTP() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    static generateOTPKey(identifier, type) {
        return `otp:${type}:${identifier}`;
    }

    // Store OTP in Redis with fallback to memory
    static async storeOTP(identifier, type = 'email_verification', expirationMinutes = 10) {
        try {
            const otp = this.generate4DigitOTP();
            const key = this.generateOTPKey(identifier, type);
            
            if (isRedisAvailable()) {
                const redis = await getRedisClient();
                if (redis) {
                    // Store OTP with expiration in Redis
                    await redis.setEx(key, expirationMinutes * 60, otp);
                    console.log(`✅ OTP stored in Redis for ${identifier}, type: ${type}, expires in ${expirationMinutes} minutes`);
                    return otp;
                }
            }
            
            // Fallback to memory store
            const expiryTime = Date.now() + (expirationMinutes * 60 * 1000);
            memoryStore.set(key, { otp, expiryTime });
            console.log(`⚠️ OTP stored in memory (Redis unavailable) for ${identifier}, type: ${type}, expires in ${expirationMinutes} minutes`);
            
            // Cleanup expired entries periodically
            this.cleanupExpiredOTPs();
            
            return otp;
        } catch (error) {
            console.error('Error storing OTP:', error);
            throw new Error('Failed to generate OTP');
        }
    }

    // Verify OTP from Redis or memory fallback
    static async verifyOTP(identifier, otp, type = 'email_verification') {
        try {
            const key = this.generateOTPKey(identifier, type);
            
            if (isRedisAvailable()) {
                const redis = await getRedisClient();
                if (redis) {
                    const storedOTP = await redis.get(key);
                    
                    if (!storedOTP) {
                        return { valid: false, message: 'OTP expired or not found' };
                    }

                    if (storedOTP !== otp) {
                        return { valid: false, message: 'Invalid OTP' };
                    }

                    // OTP is valid, delete it to prevent reuse
                    await redis.del(key);
                    
                    console.log(`✅ OTP verified successfully from Redis for ${identifier}, type: ${type}`);
                    return { valid: true, message: 'OTP verified successfully' };
                }
            }
            
            // Fallback to memory store
            const stored = memoryStore.get(key);
            
            if (!stored) {
                return { valid: false, message: 'OTP expired or not found' };
            }
            
            if (Date.now() > stored.expiryTime) {
                memoryStore.delete(key);
                return { valid: false, message: 'OTP expired' };
            }
            
            if (stored.otp !== otp) {
                return { valid: false, message: 'Invalid OTP' };
            }
            
            // OTP is valid, delete it to prevent reuse
            memoryStore.delete(key);
            
            console.log(`✅ OTP verified successfully from memory for ${identifier}, type: ${type}`);
            return { valid: true, message: 'OTP verified successfully' };
            
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw new Error('Failed to verify OTP');
        }
    }

    // Check if OTP exists (useful for resend logic)
    static async otpExists(identifier, type = 'email_verification') {
        try {
            const key = this.generateOTPKey(identifier, type);
            
            if (isRedisAvailable()) {
                const redis = await getRedisClient();
                if (redis) {
                    const exists = await redis.exists(key);
                    return exists === 1;
                }
            }
            
            // Fallback to memory store
            const stored = memoryStore.get(key);
            if (!stored) return false;
            
            // Check if expired
            if (Date.now() > stored.expiryTime) {
                memoryStore.delete(key);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error checking OTP existence:', error);
            return false;
        }
    }

    // Get remaining TTL for OTP
    static async getOTPTTL(identifier, type = 'email_verification') {
        try {
            const key = this.generateOTPKey(identifier, type);
            
            if (isRedisAvailable()) {
                const redis = await getRedisClient();
                if (redis) {
                    const ttl = await redis.ttl(key);
                    return ttl > 0 ? ttl : 0;
                }
            }
            
            // Fallback to memory store
            const stored = memoryStore.get(key);
            if (!stored) return 0;
            
            const remainingTime = Math.max(0, Math.floor((stored.expiryTime - Date.now()) / 1000));
            return remainingTime;
        } catch (error) {
            console.error('Error getting OTP TTL:', error);
            return 0;
        }
    }

    // Clean up expired OTPs from memory store
    static cleanupExpiredOTPs() {
        const now = Date.now();
        for (const [key, data] of memoryStore.entries()) {
            if (now > data.expiryTime) {
                memoryStore.delete(key);
            }
        }
    }

    // Invalidate OTP manually
    static async invalidateOTP(identifier, type = 'email_verification') {
        try {
            const redis = await getRedisClient();
            const key = this.generateOTPKey(identifier, type);
            
            const deleted = await redis.del(key);
            return deleted === 1;
        } catch (error) {
            console.error('Error invalidating OTP:', error);
            return false;
        }
    }

    // Store rate limiting info
    static async setRateLimit(identifier, type, attempts = 1, windowMinutes = 60) {
        try {
            const key = `rate_limit:${type}:${identifier}`;
            
            if (isRedisAvailable()) {
                const redis = await getRedisClient();
                if (redis) {
                    await redis.setEx(key, windowMinutes * 60, attempts.toString());
                    return true;
                }
            }
            
            // Fallback to memory store
            const expiryTime = Date.now() + (windowMinutes * 60 * 1000);
            memoryStore.set(key, { otp: attempts.toString(), expiryTime });
            return true;
        } catch (error) {
            console.error('Error setting rate limit:', error);
            return false;
        }
    }

    // Check rate limiting
    static async checkRateLimit(identifier, type, maxAttempts = 5) {
        try {
            const key = `rate_limit:${type}:${identifier}`;
            
            if (isRedisAvailable()) {
                const redis = await getRedisClient();
                if (redis) {
                    const attempts = await redis.get(key);
                    if (!attempts) return { allowed: true, remaining: maxAttempts };
                    
                    const currentAttempts = parseInt(attempts, 10);
                    if (currentAttempts >= maxAttempts) {
                        const ttl = await redis.ttl(key);
                        return { 
                            allowed: false, 
                            remaining: 0,
                            resetTime: ttl > 0 ? ttl : 0
                        };
                    }
                    
                    // Increment attempts
                    await redis.incr(key);
                    
                    return { 
                        allowed: true, 
                        remaining: maxAttempts - (currentAttempts + 1)
                    };
                }
            }
            
            // Fallback to memory store
            const stored = memoryStore.get(key);
            if (!stored) {
                // First attempt, create entry
                const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hour default
                memoryStore.set(key, { otp: '1', expiryTime });
                return { allowed: true, remaining: maxAttempts - 1 };
            }
            
            if (Date.now() > stored.expiryTime) {
                // Reset expired rate limit
                memoryStore.delete(key);
                const expiryTime = Date.now() + (60 * 60 * 1000);
                memoryStore.set(key, { otp: '1', expiryTime });
                return { allowed: true, remaining: maxAttempts - 1 };
            }
            
            const currentAttempts = parseInt(stored.otp, 10);
            if (currentAttempts >= maxAttempts) {
                const resetTime = Math.floor((stored.expiryTime - Date.now()) / 1000);
                return { 
                    allowed: false, 
                    remaining: 0,
                    resetTime: resetTime > 0 ? resetTime : 0
                };
            }
            
            // Increment attempts
            stored.otp = (currentAttempts + 1).toString();
            return { 
                allowed: true, 
                remaining: maxAttempts - (currentAttempts + 1)
            };
            
        } catch (error) {
            console.error('Error checking rate limit:', error);
            return { allowed: true, remaining: maxAttempts };
        }
    }
}

export default OTPService;