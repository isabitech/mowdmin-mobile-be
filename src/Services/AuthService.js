import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../Models/UserModel.js";


class AuthService {
    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        });
    }
    static async register(userData) {
        const { email, password, name, language } = userData;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error("Email already in use");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            password: hashedPassword,
            language,
            name
        });
        return newUser;
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
}
export default AuthService;