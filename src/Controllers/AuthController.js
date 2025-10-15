import AuthService from "../Services/AuthService.js";
import { success, error } from "../Utils/helper.js";

class AuthController {
    static async register(req, res) {
        const { email, password, name, language } = req.body;
        if (!email || !password || !name) {
            return error(res, "Name, email, and password are required", 400);
        }
        const user = await AuthService.register(req.body);
        success(res, "User registered successfully", user, 201);
    }

    static async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return error(res, "Email and password are required", 400);
        }
        const { user, token } = await AuthService.login(req.body);
        success(res, "Login successful", { user, token }, 200);
    }

    static async forgotPassword(req, res) {
        const { email } = req.body;
        if (!email) {
            return error(res, "Email is required", 400);
        }

        await AuthService.forgotPassword(email);
        success(res, null, "Password reset link sent to your email");
    }

    static async changePassword(req, res) {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return error(res, "Current and new password are required", 400);
        }

        await AuthService.changePassword(req.user.email, currentPassword, newPassword);
        success(res, null, "Password changed successfully");
    }
}

export default AuthController;
