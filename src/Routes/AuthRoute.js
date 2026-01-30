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
import multer from "multer";
import path from "path";

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

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
auth.post("/logout", tryCatch(AuthController.logout));
auth.post("/forgot-password", passwordResetLimiter, validateForgotPassword, handleValidationErrors, tryCatch(AuthController.forgotPassword));
auth.post("/reset-password", otpLimiter, validateResetPassword, handleValidationErrors, tryCatch(AuthController.resetPassword));
auth.post("/change-password", protectUser, validateChangePassword, handleValidationErrors, tryCatch(AuthController.changePassword));
auth.post("/verify-otp", otpLimiter, validateEmailVerification, handleValidationErrors, tryCatch(AuthController.verifyEmail));
auth.post("/resend-otp", passwordResetLimiter, validateResendVerification, handleValidationErrors, tryCatch(AuthController.resendEmailVerification));

// Social Authentication
auth.post("/google", authLimiter, tryCatch(AuthController.googleAuth));
auth.post("/apple", authLimiter, tryCatch(AuthController.appleAuth));

// Profile routes
auth.get("/profile/:userId", protectUser, validateUserId, handleValidationErrors, tryCatch(AuthController.getProfile));
auth.put("/profile/:userId", protectUser, validateProfileUpdate, handleValidationErrors, upload.single('photo'), tryCatch(AuthController.createOrUpdateProfile));
auth.delete("/profile/:userId", protectUser, validateUserId, handleValidationErrors, tryCatch(AuthController.deleteProfile));

// Admin Management (Admin Only)
auth.get("/admin/users", protectUser, protectAdmin, tryCatch(AuthController.getAllUsers));
auth.patch("/admin/users/:userId/promote", protectUser, protectAdmin, tryCatch(AuthController.toggleAdminStatus));

export default auth;
