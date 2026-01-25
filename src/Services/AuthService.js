import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import EmailService from "./emailService.js";
import TokenService from "./TokenService.js";
import { AppError } from "../Utils/AppError.js";
import { UserRepository } from "../repositories/UserRepository.js";
import ProfileRepository from "../repositories/ProfileRepository.js";
import { AuthRepository } from "../repositories/AuthRepository.js";

class AuthService {
    // Generate JWT token
    generateToken(id) {
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
            email,
            password: password,
            language,
            name,
        });

        const token = new AuthService().generateToken(newUser.id);

        // Store session
        const tokenHash = AuthService.hashToken(token);
        await AuthRepository.create({
            userId: newUser.id,
            tokenHash,
            ipAddress: meta.ip,
            deviceInfo: meta.userAgent
        });

        // Send welcome email asynchronously
        EmailService.sendWelcomeEmail(newUser.email, newUser.name).catch((err) =>
            console.error("Email send error:", err.message)
        );
        const userDataSafe = newUser.toJSON();
        delete userDataSafe.password;

        return { user: userDataSafe, token };
    }

    // Login user
    static async login(credentials, meta = {}) {
        const { email, password } = credentials;

        const user = await UserRepository.findByEmail(email);
        if (!user) throw new AppError("Invalid email", 401);

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) throw new AppError("Invalid password", 401);

        const token = new AuthService().generateToken(user.id);

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

        // Create a 4-digit reset token and store it
        const resetToken = await TokenService.createToken(user.id, "reset");

        // Send reset token email
        await EmailService.sendTokenEmail(user.email, resetToken);

        return { message: "Password reset email sent" };
    }

    // Reset password using token
    static async resetPassword(email, tokenValue, newPassword) {
        const user = await UserRepository.findByEmail(email);
        if (!user) throw new AppError("User not found", 404);

        // Validate token
        const isValidToken = await TokenService.validateToken(user.id, tokenValue, "reset");
        if (!isValidToken) throw new AppError("Invalid or expired token", 400);

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Revoke used token
        await TokenService.revokeToken(user.id, tokenValue, "reset");

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
    async createOrUpdateProfile(userId, profileData) {
        let profile = await ProfileRepository.findByUserId(userId);

        if (profile) {
            await ProfileRepository.update(profile, profileData);
        } else {
            profile = await ProfileRepository.create({ ...profileData, userId });
        }

        profile = await ProfileRepository.findByIdWithUser(profile.id, User);

        return profile;
    }

}

export default AuthService;
