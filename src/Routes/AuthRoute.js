import { Router } from "express";
import AuthController from "../Controllers/AuthController.js";
import { validateUser, handleValidationErrors } from "../Utils/Validator.js";

const auth = Router();

auth.post("/register", validateUser, handleValidationErrors, AuthController.register);
auth.post("/login", AuthController.login);
auth.post("/forgot-password", AuthController.forgotPassword);

export default auth;
