import AuthService from "../Services/AuthService.js";
import { sendSuccess, sendError } from "../core/response.js";

class AuthController {
    // Register
    static async register(req, res) {
        const meta = {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };
        const user = await AuthService.register(req.body, meta);
        return sendSuccess(res, { message: "User registered successfully", data: user, statusCode: 201 });
    }

    // Login
    static async login(req, res) {
        const meta = {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };
        const { user, token } = await AuthService.login(req.body, meta);
        return sendSuccess(res, { message: "Login successful", data: { user, token }, statusCode: 200 });
    }

    // Logout
    static async logout(req, res) {
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            await AuthService.logout(token);
        }
        return sendSuccess(res, { message: "Logged out successfully", data: {}, statusCode: 200 });
    }

    // Forgot Password — send token
    static async forgotPassword(req, res) {

        await AuthService.forgotPassword(req.body.email);
        return sendSuccess(res, { message: "Password reset token sent to your email", data: {}, statusCode: 200 });

    }

    // Reset Password — verify token and set new password
    static async resetPassword(req, res) {

        await AuthService.resetPassword(req.body.email, req.body.token, req.body.newPassword);
        return sendSuccess(res, { message: "Password reset successfully", data: {}, statusCode: 200 });

    }

    // Change Password — for logged-in users
    static async changePassword(req, res) {
        await AuthService.changePassword(req.body.email, req.body.currentPassword, req.body.newPassword);
        return sendSuccess(res, { message: "Password changed successfully", data: {}, statusCode: 200 });

    }
    async createOrUpdateProfile(req, res) {
        const userId = req.params.userId; // assuming userId comes from route
        const data = { ...req.body };

        // Attach uploaded file path if it exists
        if (req.file) data.photoUrl = `/uploads/${req.file.filename}`;

        // Call service to create or update the profile
        const profile = await AuthService.createOrUpdateProfile(userId, data);

        // Format image URL if exists
        const profileData = {
            ...profile.toJSON(),
            photoUrl: profile.photoUrl
                ? `${req.protocol}://${req.get("host")}${profile.photoUrl}`
                : null,
        };

        return sendSuccess(res, { message: "Profile saved successfully", data: profileData });
    }
}

export default AuthController;
