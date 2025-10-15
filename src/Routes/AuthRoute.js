import { Router } from "express";
import AuthController from "../Controllers/AuthController.js";
import {
    validateUserRegistration,
    validateUserLogin, validateForgotPassword,
    handleValidationErrors,
} from "../middleware/Validation/authValidation.js";

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
auth.post("/change-password", tryCatch(AuthController.changePassword));

export default auth;
