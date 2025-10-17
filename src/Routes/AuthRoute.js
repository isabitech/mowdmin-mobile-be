import { Router } from "express";
import AuthController from "../Controllers/AuthController.js";
import {
    validateUserRegistration,
    validateUserLogin, validateForgotPassword,
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
auth.post("/reset-password", tryCatch(AuthController.resetPassword));
auth.post("/change-password", tryCatch(AuthController.forgotPassword))

export default auth;
