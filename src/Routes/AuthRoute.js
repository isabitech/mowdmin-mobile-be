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
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";
import { tryCatch } from "../Utils/try-catch.js";

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

export default auth;
