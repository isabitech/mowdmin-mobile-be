import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import EmailService from "./emailService.js";
import TokenService from "./TokenService.js";
import OTPService from "./OTPService.js";
import { AppError } from "../Utils/AppError.js";
import { UserRepository } from "../repositories/UserRepository.js";
import ProfileRepository from "../repositories/ProfileRepository.js";
import { AuthRepository } from "../repositories/AuthRepository.js";

class AuthService {
    // Generate JWT token
    static generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        });
    }

    // Helper to hash token
    static hashToken(token) {
        return crypto.createHash("sha256").update(token).digest("hex");
    }

    // Register a new user
    static async register(userData, meta = {}) {
        const { email, password, name, language } = userData;

        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) throw new AppError("Email already in use", 400);
        const newUser = await UserRepository.create({

            // Create user with email unverified
            email,
            password: password,
            language,
            name,
            emailVerified: false,
        });

        // Generate and send email verification OTP
        try {
            const otp = await OTPService.storeOTP(email, 'email_verification', 10);
            await EmailService.sendEmailVerificationOTP(email, otp, name);
            console.log(`✅ Email verification OTP sent to ${email}`);
        } catch (error) {
            console.error('Failed to send verification email:', error.message);
            // Don't fail registration if email sending fails
        }

        // const token = new AuthService().generateToken(newUser.id);

        // // Store session
        // const tokenHash = AuthService.hashToken(token);
        // await AuthRepository.create({
        //     userId: newUser.id,
        //     tokenHash,
        //     ipAddress: meta.ip,
        //     deviceInfo: meta.userAgent
        // });

        // Send welcome email asynchronously
        EmailService.sendWelcomeEmail(newUser.email, newUser.name).catch((err) =>
            console.error("Email send error:", err.message)
        );
        const userDataSafe = newUser.toJSON();
        delete userDataSafe.password;
        delete userDataSafe.isAdmin;
        delete userDataSafe.emailVerifiedAt;

        return {
            user: userDataSafe,
            token: null,
            message: "Registration successful! Please check your email for verification code."
        };
    }

    // Login user
    static async login(email, password, meta = {}) {
        const user = await UserRepository.findByEmail(email);
        if (!user) throw new AppError("Invalid email or password", 401);

        // Check if user has a password (not a social-only account)
        if (!user.password || user.password === null) {
            // User signed up with social auth (Google/Apple)
            const authMethod = user.googleId ? 'Google' : user.appleId ? 'Apple' : 'social';
            throw new AppError(
                `This account uses ${authMethod} sign-in. Please use the "${authMethod} Sign-In" button instead.`,
                400
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new AppError("Invalid email or password", 401);

        const token = AuthService.generateToken(user.id);

        // Store session
        const tokenHash = AuthService.hashToken(token);
        await AuthRepository.create({
            userId: user.id,
            tokenHash,
            ipAddress: meta.ip,
            deviceInfo: meta.userAgent
        });
        const userDataSafe = user.toJSON();
        delete userDataSafe.password;
        delete userDataSafe.isAdmin;
        delete userDataSafe.emailVerifiedAt;
        return { user: userDataSafe, token };
    }

    // Logout user
    static async logout(token) {
        const tokenHash = AuthService.hashToken(token);
        await AuthRepository.revokeToken(null, tokenHash); // Passing null for userId as we might strictly revoke by hash, or we can update revokeToken to handle just hash if unique
        // Actually AuthRepository.revokeToken expects (userId, tokenHash).
        // Let's check repository. findByTokenHash is safer.
        const session = await AuthRepository.findByTokenHash(tokenHash);
        if (session) {
            await AuthRepository.revokeToken(session.userId, tokenHash);
        }
        return { message: "Logged out successfully" };
    }

    // Forgot password: send reset token via email
    static async forgotPassword(email) {
        const user = await UserRepository.findByEmail(email);
        if (!user) throw new AppError("Email not found", 404);

        // Check rate limiting for password reset requests
        const rateCheck = await OTPService.checkRateLimit(email, 'password_reset', 3);
        if (!rateCheck.allowed) {
            throw new AppError(`Too many password reset attempts. Try again in ${Math.ceil(rateCheck.resetTime / 60)} minutes.`, 429);
        }

        // Generate and store reset OTP in Redis
        const resetOTP = await OTPService.storeOTP(email, 'password_reset', 15);

        // Send reset OTP email
        await EmailService.sendTokenEmail(user.email, resetOTP, "Password Reset");

        return { message: "Password reset code sent to your email" };
    }

    // Reset password using OTP
    static async resetPassword(email, otp, newPassword) {
        const user = await UserRepository.findByEmail(email);
        if (!user) throw new AppError("User not found", 404);

        // Verify OTP from Redis
        const verification = await OTPService.verifyOTP(email, otp, 'password_reset');
        if (!verification.valid) {
            throw new AppError(verification.message, 400);
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        console.log(`✅ Password reset successfully for ${email}`);
        return { message: "Password has been reset successfully" };
    }

    // Change password (authenticated user)
    static async changePassword(email, currentPassword, newPassword) {
        const user = await UserRepository.findByEmail(email);
        if (!user) throw new AppError("User not found", 404);

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) throw new AppError("Current password is incorrect", 400);

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return { message: "Password changed successfully" };
    }

    // Verify email with OTP
    static async verifyEmail(email, otp) {
        const user = await UserRepository.findByEmail(email);
        if (!user) throw new AppError("User not found", 404);

        if (user.emailVerified) {
            throw new AppError("Email is already verified", 400);
        }

        // Verify OTP from Redis
        const verification = await OTPService.verifyOTP(email, otp, 'email_verification');
        if (!verification.valid) {
            throw new AppError(verification.message, 400);
        }

        // Mark email as verified
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        await user.save();

        // Send welcome email after successful verification
        try {
            await EmailService.sendWelcomeEmail(user.email, user.name);
            console.log(`✅ Welcome email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send welcome email:', error.message);
            // Don't fail verification if welcome email fails
        }

        console.log(`✅ Email verified successfully for ${email}`);
        return {
            message: "Email verified successfully! Welcome to Mowdministries!",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: true,
                emailVerifiedAt: user.emailVerifiedAt
            }
        };
    }

    // Resend email verification OTP
    static async resendEmailVerification(email) {
        const user = await UserRepository.findByEmail(email);
        if (!user) throw new AppError("User not found", 404);

        if (user.emailVerified) {
            throw new AppError("Email is already verified", 400);
        }

        // Check if OTP already exists and hasn't expired
        const otpExists = await OTPService.otpExists(email, 'email_verification');
        if (otpExists) {
            const ttl = await OTPService.getOTPTTL(email, 'email_verification');
            throw new AppError(`Verification code already sent. Please wait ${Math.ceil(ttl / 60)} minutes before requesting a new one.`, 429);
        }

        // Check rate limiting for resend requests
        const rateCheck = await OTPService.checkRateLimit(email, 'email_resend', 3);
        if (!rateCheck.allowed) {
            throw new AppError(`Too many resend attempts. Try again in ${Math.ceil(rateCheck.resetTime / 60)} minutes.`, 429);
        }

        // Generate and send new OTP
        const otp = await OTPService.storeOTP(email, 'email_verification', 10);
        await EmailService.sendEmailVerificationOTP(email, otp, user.name);

        console.log(`✅ Email verification OTP resent to ${email}`);
        return { message: "Verification code sent to your email" };
    }

    static async createOrUpdateProfile(userId, profileData) {
        let profile = await ProfileRepository.findByUserId(userId);

        if (profile) {
            await ProfileRepository.update(profile, profileData);
        } else {
            profile = await ProfileRepository.create({ ...profileData, userId });
        }

        profile = await ProfileRepository.findByUserIdWithUser(userId);

        return profile;
    }

    // Get user profile
    static async getProfile(userId) {
        const profile = await ProfileRepository.findByUserIdWithUser(userId);

        if (!profile) {
            throw new AppError("Profile not found", 404);
        }

        return profile;
    }

    // Delete user profile
    static async deleteProfile(userId) {
        const profile = await ProfileRepository.findByUserId(userId);

        if (!profile) {
            throw new AppError("Profile not found", 404);
        }

        await profile.destroy();
        return { message: "Profile deleted successfully" };
    }

    // LIST all users (Admin Only)
    static async getAllUsers() {
        return await UserRepository.findAll();
    }

    // TOGGLE admin status (Admin Only)
    static async toggleAdminStatus(userId) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new AppError("User not found", 404);

        const newAdminStatus = !user.isAdmin;
        return await UserRepository.update(userId, { isAdmin: newAdminStatus });
    }

    // UPDATE user by Admin (Exclude password)
    static async updateUserByAdmin(userId, updateData) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new AppError("User not found", 404);

        // Explicitly prevent password updates via this method
        if (updateData.password) {
            delete updateData.password;
        }

        // Prevent modification of critical system fields if needed
        // For now, only password is strictly forbidden as per requirements

        return await UserRepository.update(userId, updateData);
    }

    // ADMIN Trigger OTP (Password Reset)
    static async adminTriggerPasswordReset(userId) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new AppError("User not found", 404);

        if (!user.email) throw new AppError("User does not have an email address", 400);

        // Generate and send reset OTP
        // Logic same as forgotPassword but initiated by admin (bypassing rate limit if strictly needed, but better to keep it safer)
        // Here we just reuse forgotPassword logic but maybe we skip the public rate limit?
        // Let's call forgotPassword logic directly for simplicity, or reimplement to ensure it works for admin context
        // The requirement says "admin should just help to trigger otp", implying sending it to the USER.

        return await AuthService.forgotPassword(user.email);
    }

    // Social Auth Helper Methods
    static async findUserByGoogleId(googleId) {
        return await UserRepository.findOne({ googleId });
    }

    static async findUserByAppleId(appleId) {
        return await UserRepository.findOne({ appleId });
    }

    static async linkGoogleAccount(userId, googleId) {
        return await UserRepository.update(userId, {
            googleId,
        });
    }

    static async linkAppleAccount(userId, appleId) {
        return await UserRepository.update(userId, { appleId });
    }

    static async createUserFromGoogle(data) {
        return await UserRepository.create({
            email: data.email,
            name: data.name,
            googleId: data.googleId,
            emailVerified: true,
            password: null, // No password for social auth
        });
    }

    static async createUserFromApple(data) {
        return await UserRepository.create({
            email: data.email,
            name: data.name,
            appleId: data.appleId,
            emailVerified: true,
            password: null, // No password for social auth
        });
    }
}

export default AuthService;
