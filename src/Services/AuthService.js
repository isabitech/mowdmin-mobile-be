import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../Models/UserModel.js";
import Token from "../Models/TokenModel.js";
import EmailService from "./emailService.js";


class AuthService {
    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        });
    }
    static async register(userData) {
        const { email, password, name, language } = userData;

        // Check if the email is already in use
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error("Email already in use");
        }

        // Create user
        const newUser = await User.create({
            email,
            password,
            language,
            name
        });

        // Generate JWT token
        const token = new AuthService().generateToken(newUser.id);

        // Send welcome email (asynchronous, don’t block response)
        EmailService.sendEmail(
            newUser.email,
            "OnBoarding Message",
            "Welcome to Mowdministries",
            `<p>Hello ${newUser.name},</p>
         <p>Thank you for registering at Mowdministries!</p>
         <p>Your registration was successful.</p>`
        ).catch(err => console.error("Email send error:", err.message));

        // Remove password from the response
        const userDataSafe = newUser.toJSON();
        delete userDataSafe.password;

        // Return user (without password) and token
        return { user: userDataSafe, token };
    }


    static async login(credentials) {
        const { email, password } = credentials;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("Invalid email or password");
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid email or password");
        }
        const token = new AuthService().generateToken(user.id);
        return { user, token };
    }
    static async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("Email not found");
        }
        // Implement password reset logic (e.g., send email with reset link)
        return true;
    }
    
    static async changePassword(email, currentPassword, newPassword) {
        const user = await User.findOne(email);
        if (!user) {
            throw new Error("User not found");
        }
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw new Error("Current password is incorrect");
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return true;
    }
    static async
}
export default AuthService