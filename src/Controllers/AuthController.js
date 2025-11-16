import AuthService from "../Services/AuthService.js";
import { success, error } from "../Utils/helper.js";

class AuthController {
    // Register
    static async register(req, res) {

        const { email, password, name, language } = req.body;
        if (!email || !password || !name) {
            return error(res, "Name, email, and password are required", 400);
        }

        const user = await AuthService.register({ email, password, name, language });
        return success(res, "User registered successfully", user, 201);

    }

    // Login
    static async login(req, res) {

        const { email, password } = req.body;
        if (!email || !password) {
            return error(res, "Email and password are required", 400);
        }

        const { user, token } = await AuthService.login({ email, password });
        return success(res, "Login successful", { user, token }, 200);

    }

    // Forgot Password — send token
    static async forgotPassword(req, res) {

        const { email } = req.body;
        if (!email) {
            return error(res, "Email is required", 400);
        }

        await AuthService.forgotPassword(email);
        return success(res, "Password reset token sent to your email", null, 200);

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

        const { email, currentPassword, newPassword, confirmPassword } = req.body;

        if (!email || !currentPassword || !newPassword || !confirmPassword) {
            return error(res, "Email, current password, and new passwords are required", 400);
        }

        if (newPassword !== confirmPassword) {
            return error(res, "New password and confirmation must match", 400);
        }

        await AuthService.changePassword(email, currentPassword, newPassword);
        return success(res, "Password changed successfully", null, 200);

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

        return success(res, "Profile saved successfully", profileData);
    }
}

export default AuthController;
