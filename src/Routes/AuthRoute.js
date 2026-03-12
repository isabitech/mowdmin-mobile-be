import { Router } from "express";
import AuthController from "../Controllers/AuthController.js";
import {
    validateUserRegistration,
    validateUserLogin,
    validateForgotPassword,
    validateResetPassword,
    validateEmailVerification,
    validateResendVerification,
    validateChangePassword,
} from "../middleware/Validation/authValidation.js";
import { validateProfileUpdate, validateUserId } from "../middleware/Validation/profileValidation.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import { authLimiter, otpLimiter, passwordResetLimiter } from "../middleware/rateLimiter.js";
import { tryCatch } from "../Utils/try-catch.js";
import upload from "../Config/multer.js";

const auth = Router();

auth.post(
    "/register",
    validateUserRegistration,
    handleValidationErrors,
    tryCatch(AuthController.register)
);
auth.post(
    "/login",
    authLimiter,
    validateUserLogin,
    handleValidationErrors,
    tryCatch(AuthController.login)
);
auth.post("/logout", protectUser, tryCatch(AuthController.logout));
auth.post("/refresh", authLimiter, tryCatch(AuthController.refreshToken));
auth.post("/forgot-password", passwordResetLimiter, validateForgotPassword, handleValidationErrors, tryCatch(AuthController.forgotPassword));
auth.post("/reset-password", otpLimiter, validateResetPassword, handleValidationErrors, tryCatch(AuthController.resetPassword));
auth.post("/change-password", protectUser, validateChangePassword, handleValidationErrors, tryCatch(AuthController.changePassword));
auth.post("/verify-otp", otpLimiter, validateEmailVerification, handleValidationErrors, tryCatch(AuthController.verifyEmail));
auth.post("/verify-email", otpLimiter, validateEmailVerification, handleValidationErrors, tryCatch(AuthController.verifyEmail));

auth.post("/resend-otp", passwordResetLimiter, validateResendVerification, handleValidationErrors, tryCatch(AuthController.resendEmailVerification));

// Social Authentication
auth.post("/google", authLimiter, tryCatch(AuthController.googleAuth));
auth.post("/apple", authLimiter, tryCatch(AuthController.appleAuth));

// Profile routes
auth.get("/profile", protectUser, tryCatch(AuthController.getProfile));
auth.put("/profile", protectUser, validateProfileUpdate, handleValidationErrors, upload.single('photo'), tryCatch(AuthController.createOrUpdateProfile));
auth.delete("/profile", protectUser, tryCatch(AuthController.deleteProfile));

// Admin Management (Admin Only)
auth.get("/admin/users", protectUser, protectAdmin, tryCatch(AuthController.getAllUsers));
auth.get("/admin/users/:userId", protectUser, protectAdmin, tryCatch(AuthController.getUserById));
auth.put("/admin/users/:userId", protectUser, protectAdmin, tryCatch(AuthController.adminUpdateUser));
auth.patch("/admin/users/:userId/promote", protectUser, protectAdmin, tryCatch(AuthController.toggleAdminStatus));
auth.post("/admin/users/:userId/otp", protectUser, protectAdmin, tryCatch(AuthController.adminTriggerOTP));

export default auth;
