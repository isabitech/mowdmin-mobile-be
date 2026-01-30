import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { AppError } from '../Utils/AppError.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { AuthRepository } from '../repositories/AuthRepository.js';
import AuthService from './AuthService.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class SocialAuthService {
    /**
     * Verify Google ID token and authenticate user
     * @param {string} idToken - Google ID token from client
     * @returns {object} User and JWT token
     */
    static async authenticateWithGoogle(idToken) {
        try {
            // Verify the Google token
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const { sub: googleId, email, name, picture, email_verified } = payload;

            if (!email_verified) {
                throw new AppError('Email not verified by Google', 400);
            }

            // Check if user exists with this Google ID or email
            let user = await AuthService.findUserByGoogleId(googleId);

            if (!user) {
                // Check if user exists with this email
                user = await UserRepository.findByEmail(email);

                if (user) {
                    // Link Google account to existing user
                    user = await AuthService.linkGoogleAccount(user.id, googleId);
                } else {
                    // Create new user with Google account
                    user = await AuthService.createUserFromGoogle({
                        googleId,
                        email,
                        name,
                        isEmailVerified: true,
                    });
                }
            }

            // Update or create profile with picture
            if (picture) {
                await AuthService.createOrUpdateProfile(user.id, { photoUrl: picture });
            }

            // Generate JWT token
            const token = AuthService.generateToken(user.id);

            // Store session
            const tokenHash = AuthService.hashToken(token);
            await AuthRepository.create({
                userId: user.id,
                tokenHash,
                ipAddress: null, // Can be passed as parameter if needed
                deviceInfo: null
            });

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    emailVerified: user.emailVerified,
                },
                token,
            };
        } catch (error) {
            if (error.message.includes('Token used too late')) {
                throw new AppError('Google token expired', 401);
            }
            if (error.message.includes('Invalid token')) {
                throw new AppError('Invalid Google token', 401);
            }
            throw error;
        }
    }

    /**
     * Verify Apple ID token and authenticate user
     * @param {string} identityToken - Apple identity token from client
     * @param {object} user - User data from Apple (optional, only on first sign-in)
     * @returns {object} User and JWT token
     */
    static async authenticateWithApple(identityToken, appleUserData = null) {
        try {
            // Verify Apple token with Apple's public keys
            const appleClient = jwksClient({
                jwksUri: 'https://appleid.apple.com/auth/keys',
                cache: true,
                cacheMaxAge: 86400000, // 24 hours
            });

            const getKey = (header, callback) => {
                appleClient.getSigningKey(header.kid, (err, key) => {
                    if (err) {
                        return callback(err);
                    }
                    const signingKey = key.getPublicKey();
                    callback(null, signingKey);
                });
            };

            // Verify token signature and claims
            const decoded = await new Promise((resolve, reject) => {
                jwt.verify(identityToken, getKey, {
                    algorithms: ['RS256'],
                    issuer: 'https://appleid.apple.com',
                    audience: process.env.APPLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID, // Fallback for testing
                }, (err, decoded) => {
                    if (err) reject(err);
                    else resolve(decoded);
                });
            });

            if (!decoded || !decoded.sub) {
                throw new AppError('Invalid Apple token', 401);
            }

            const appleId = decoded.sub;
            const email = decoded.email;

            // Check if user exists with this Apple ID
            let user = await AuthService.findUserByAppleId(appleId);

            if (!user) {
                // Apple only provides user data on first sign-in
                if (!email) {
                    throw new AppError('Email required for first sign-in', 400);
                }

                // Check if user exists with this email
                user = await UserRepository.findByEmail(email);

                if (user) {
                    // Link Apple account to existing user
                    user = await AuthService.linkAppleAccount(user.id, appleId);
                } else {
                    // Create new user with Apple account
                    const name = appleUserData?.name
                        ? `${appleUserData.name.firstName || ''} ${appleUserData.name.lastName || ''}`.trim()
                        : email.split('@')[0];

                    user = await AuthService.createUserFromApple({
                        appleId,
                        email,
                        name,
                        isEmailVerified: true, // Apple verifies emails
                    });
                }
            }

            // Generate JWT token
            const token = AuthService.generateToken(user.id);

            // Store session
            const tokenHash = AuthService.hashToken(token);
            await AuthRepository.create({
                userId: user.id,
                tokenHash,
                ipAddress: null, // Can be passed as parameter if needed
                deviceInfo: null
            });

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    emailVerified: user.emailVerified,
                },
                token,
            };
        } catch (error) {
            if (error.isOperational) throw error;
            if (error.name === 'JsonWebTokenError') {
                throw new AppError('Invalid Apple token signature', 401);
            }
            if (error.name === 'TokenExpiredError') {
                throw new AppError('Apple token expired', 401);
            }
            throw new AppError('Apple authentication failed: ' + error.message, 401);
        }
    }
}

export default SocialAuthService;
