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

        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword) {
            return error(res, "All fields are required", 400);
        }

        if (newPassword !== confirmPassword) {
            return error(res, "New password and confirmation must match", 400);
        }

        await AuthService.resetPassword(email, otp, newPassword);
        return success(res, "Password reset successfully", null, 200);

    }

    // Verify Email with OTP
    static async verifyEmail(req, res) {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return error(res, "Email and verification code are required", 400);
        }

        const result = await AuthService.verifyEmail(email, otp);
        return success(res, result.message, result.user, 200);
    }

    // Resend Email Verification OTP
    static async resendEmailVerification(req, res) {
        const { email } = req.body;

        if (!email) {
            return error(res, "Email is required", 400);
        }

        const result = await AuthService.resendEmailVerification(email);
        return success(res, result.message, null, 200);
    }

    // Change Password — for logged-in users
    static async changePassword(req, res) {
        await AuthService.changePassword(req.body.email, req.body.currentPassword, req.body.newPassword);
        return sendSuccess(res, { message: "Password changed successfully", data: {}, statusCode: 200 });

    }

    // Get user profile
    static async getProfile(req, res) {
        const { userId } = req.params;

        if (!userId) {
            return error(res, "User ID is required", 400);
        }

        const profile = await AuthService.getProfile(userId);

        if (!profile) {
            return error(res, "Profile not found", 404);
        }

        // Format image URL if exists
        const profileData = {
            ...profile.toJSON(),
            photoUrl: profile.photoUrl
                ? `${req.protocol}://${req.get("host")}${profile.photoUrl}`
                : null,
        };

        return success(res, "Profile retrieved successfully", profileData, 200);
    }

    // Create or update user profile
    static async createOrUpdateProfile(req, res) {
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

    // Delete user profile
    static async deleteProfile(req, res) {
        const { userId } = req.params;

        if (!userId) {
            return error(res, "User ID is required", 400);
        }

        await AuthService.deleteProfile(userId);
        return success(res, "Profile deleted successfully", null, 200);
    }
}

export default AuthController;
