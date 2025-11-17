import { Router } from "express";
import AuthController from "../Controllers/AuthController.js";
import {
    validateUserRegistration,
    validateUserLogin, 
    validateForgotPassword,
    validateResetPassword,
    validateEmailVerification,
    validateResendVerification,
} from "../middleware/Validation/authValidation.js";
import { validateProfileUpdate, validateUserId } from "../middleware/Validation/profileValidation.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";
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
    validateUserLogin,
    handleValidationErrors,
    tryCatch(AuthController.login)
);
auth.post("/forgot-password", validateForgotPassword, handleValidationErrors, tryCatch(AuthController.forgotPassword));
auth.post("/reset-password", validateResetPassword, handleValidationErrors, tryCatch(AuthController.resetPassword));
auth.post("/change-password", tryCatch(AuthController.changePassword));
auth.post("/verify-email", validateEmailVerification, handleValidationErrors, tryCatch(AuthController.verifyEmail));
auth.post("/resend-verification", validateResendVerification, handleValidationErrors, tryCatch(AuthController.resendEmailVerification));

// Profile routes
auth.get("/profile/:userId", validateUserId, handleValidationErrors, tryCatch(AuthController.getProfile));
auth.put("/profile/:userId", validateProfileUpdate, handleValidationErrors, upload.single('photo'), tryCatch(AuthController.createOrUpdateProfile));
auth.delete("/profile/:userId", validateUserId, handleValidationErrors, tryCatch(AuthController.deleteProfile));

export default auth;
