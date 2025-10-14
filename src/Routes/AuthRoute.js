import { Router } from "express";
import AuthController from "../Controllers/AuthController.js";

const auth = Router();

auth.post("/register", AuthController.register);
auth.post("/login", AuthController.login);
auth.post("/forgot-password", AuthController.forgotPassword);

export default auth;
