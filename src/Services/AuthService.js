import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/UserModel.js";
import EmailService from "./emailService.js";
import TokenService from "./TokenService.js";
import OTPService from "./OTPService.js";
import { AppError } from "../Utils/AppError.js";
import Profile from "../Models/ProfileModel.js";

class AuthService {
    // Generate JWT token
    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        });
    }

    // Register a new user
    static async register(userData) {
        const { email, password, name, language } = userData;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) throw new AppError("Email already in use", 400);
        
        // Create user with email unverified
        const newUser = await User.create({
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

        const token = new AuthService().generateToken(newUser.id);
        
        const userDataSafe = newUser.toJSON();
        delete userDataSafe.password;

        return { 
            user: userDataSafe, 
            token,
            message: "Registration successful! Please check your email for verification code."
        };
    }

    // Login user
    static async login(credentials) {
        const { email, password } = credentials;

        const user = await User.findOne({ where: { email } });
        if (!user) throw new AppError("Invalid email", 401);

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) throw new AppError("Invalid password", 401);

        const token = new AuthService().generateToken(user.id);

        const userDataSafe = user.toJSON();
        delete userDataSafe.password;

        return { user: userDataSafe, token };
    }

    // Forgot password: send reset token via email
    static async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
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
        const user = await User.findOne({ where: { email } });
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
        const user = await User.findOne({ where: { email } });
        if (!user) throw new AppError("User not found", 404);

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) throw new AppError("Current password is incorrect", 400);

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return { message: "Password changed successfully" };
    }

    // Verify email with OTP
    static async verifyEmail(email, otp) {
        const user = await User.findOne({ where: { email } });
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
        const user = await User.findOne({ where: { email } });
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

    async createOrUpdateProfile(userId, profileData) {
        let profile = await Profile.findOne({ where: { userId } });

        if (profile) {
            await profile.update(profileData);
        } else {
            profile = await Profile.create({ ...profileData, userId });
        }

        profile = await Profile.findByPk(profile.id, {
            include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
        });

        return profile;
    }

}

export default AuthService;
