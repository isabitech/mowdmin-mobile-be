import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../Models/UserModel.js";
import EmailService from "./emailService.js";
import TokenService from "./TokenService.js";
import { AppError } from "../Utils/AppError.js";

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

        // Check if email is already in use
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new AppError("Email already in use", 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            email,
            password: hashedPassword,
            language,
            name,
        });

        // Generate JWT token
        const token = new AuthService().generateToken(newUser.id);

        // Send welcome email asynchronously
        EmailService.sendWelcomeEmail(newUser.email, newUser.name).catch((err) =>
            console.error("Email send error:", err.message)
        );

        // Remove password from response
        const userDataSafe = newUser.toJSON();
        delete userDataSafe.password;

        return { user: userDataSafe, token };
    }

    // Login user
    static async login(credentials) {
        const { email, password } = credentials;

        const user = await User.findOne({ where: { email } });
        if (!user) throw new AppError("Invalid email", 401);

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) throw new AppError("Invalid  password", 401);

        const token = new AuthService().generateToken(user.id);

        // Remove password before returning
        const userDataSafe = user.toJSON();
        delete userDataSafe.password;

        return { user: userDataSafe, token };
    }

    // Send password reset token via email
    static async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new AppError("Email not found", 404);

        // Generate reset token
        const resetToken = new TokenService().createToken(user.id);

        // Send token email
        await EmailService.sendTokenEmail(user.email, resetToken, "Password Reset");

        return { message: "Password reset email sent" };
    }

    // Change password
    static async changePassword(email, currentPassword, newPassword) {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new AppError("User not found", 404);

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) throw new AppError("Current password is incorrect", 400);

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return { message: "Password changed successfully" };
    }
}

export default AuthService;
