import AuthService from "../Services/AuthService.js";
import { sendSuccess, sendError } from "../core/response.js";

class AuthController {


    // Register
    static async register(req, res) {

        const user = await AuthService.register(req.body);
        return sendSuccess(res, { message: "User registered successfully", data: user, statusCode: 201 });
    }

    // Login
    static async login(req, res) {
        const { email, password } = req.body;
        const meta = {
            ip: req.ip,
            userAgent: req.headers['user-agent']
        };
        const { user, token } = await AuthService.login(email, password, meta);
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

    // Verify Email with OTP
    static async verifyEmail(req, res) {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return sendError(res, { message: "Email and verification code are required", statusCode: 400 });
        }
        const result = await AuthService.verifyEmail(email, otp);
        return sendSuccess(res, { message: result.message, data: result.user, statusCode: 200 });
    }

    // Resend Email Verification OTP
    static async resendEmailVerification(req, res) {
        const { email } = req.body;

        if (!email) {
            return sendError(res, { message: "Email is required", statusCode: 400 });
        }

        const result = await AuthService.resendEmailVerification(email);
        return sendSuccess(res, { message: result.message, data: null, statusCode: 200 });
    }

    // Change Password — for logged-in users
    static async changePassword(req, res) {
        await AuthService.changePassword(req.body.email, req.body.currentPassword, req.body.newPassword);
        return sendSuccess(res, { message: "Password changed successfully", data: {}, statusCode: 200 });

    }

    // Get user profile
    static async getProfile(req, res) {
        const userId = req.user.id;

        if (!userId) {
            return sendError(res, { message: "User ID is required", statusCode: 400 });
        }

        const profile = await AuthService.getProfile(userId);

        if (!profile) {
            return sendError(res, { message: "Profile not found", statusCode: 404 });
        }

        // Format image URL if exists
        const formatPhotoUrl = (url) => {
            if (!url) return null;
            if (url.startsWith('http')) return url;
            return `${process.env.BASE_URL}${url}`;
        };

        const profileData = {
            ...profile.toJSON(),
            photoUrl: formatPhotoUrl(profile.photoUrl),
        };

        return sendSuccess(res, { message: "Profile retrieved successfully", data: profileData, statusCode: 200 });
    }

    // Create or update user profile
    static async createOrUpdateProfile(req, res) {
        const userId = req.user.id;
        const data = { ...req.body };

        // Attach uploaded file path if it exists
        if (req.file) data.photoUrl = `/uploads/${req.file.filename}`;

        // Call service to create or update the profile
        const profile = await AuthService.createOrUpdateProfile(userId, data);

        // Format image URL if exists
        const profileData = {
            ...profile.toJSON(),
            photoUrl: profile.photoUrl
                ? `${process.env.BASE_URL}${profile.photoUrl}`
                : null,
        };

        return sendSuccess(res, { message: "Profile saved successfully", data: profileData, statusCode: 200 });
    }

    // Delete user profile
    static async deleteProfile(req, res) {
        const userId = req.user.id;

        if (!userId) {
            return sendError(res, { message: "User ID is required", statusCode: 400 });
        }

        await AuthService.deleteProfile(userId);
        return sendSuccess(res, { message: "Profile deleted successfully", data: null, statusCode: 200 });
    }

    // LIST all users (Admin Only)
    static async getAllUsers(req, res) {
        const users = await AuthService.getAllUsers();
        return sendSuccess(res, { message: "Users retrieved successfully", data: users, statusCode: 200 });
    }

    // TOGGLE admin status (Admin Only)
    static async toggleAdminStatus(req, res) {
        const { userId } = req.params;
        const result = await AuthService.toggleAdminStatus(userId);
        return sendSuccess(res, { message: `Admin status toggled successfully`, data: result, statusCode: 200 });
    }

    // UPDATE User (Admin Only)
    static async adminUpdateUser(req, res) {
        const { userId } = req.params;
        const updateData = req.body;

        // Remove password from body if present, just to be double safe at controller level too
        delete updateData.password;

        const result = await AuthService.updateUserByAdmin(userId, updateData);
        return sendSuccess(res, { message: "User updated successfully (Admin)", data: result, statusCode: 200 });
    }

    // TRIGGER OTP (Admin Only)
    static async adminTriggerOTP(req, res) {
        const { userId } = req.params;
        await AuthService.adminTriggerPasswordReset(userId);
        return sendSuccess(res, { message: "OTP sent to user's email", data: null, statusCode: 200 });
    }

    // Social Authentication - Google
    static async googleAuth(req, res) {
        const { idToken } = req.body;

        if (!idToken) {
            throw new AppError('Google ID token is required', 400);
        }

        const SocialAuthService = (await import('../Services/SocialAuthService.js')).default;
        const result = await SocialAuthService.authenticateWithGoogle(idToken);

        return sendSuccess(res, {
            message: 'Google authentication successful',
            data: result,
            statusCode: 200
        });
    }

    // Social Authentication - Apple
    static async appleAuth(req, res) {
        const { identityToken, user } = req.body;

        if (!identityToken) {
            throw new AppError('Apple identity token is required', 400);
        }

        const SocialAuthService = (await import('../Services/SocialAuthService.js')).default;
        const result = await SocialAuthService.authenticateWithApple(identityToken, user);

        return sendSuccess(res, {
            message: 'Apple authentication successful',
            data: result,
            statusCode: 200
        });
    }

    // Create Admin
    static async createAdmin(req, res) {
        const admin = await AuthService.createAdmin(req.body);
        return sendSuccess(res, { message: "Admin created successfully", data: admin, statusCode: 201 });
    }
}

export default AuthController;
