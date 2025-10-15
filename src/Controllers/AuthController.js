import { request, response } from "express";
import AuthService from "../Services/AuthService.js";
import { success, error } from "../Utils/helper.js";

class AuthController {
    static async register(req = request, res = response) {
        const { email, password, name, language } = req.body;
        if (!email || !password || !name) {
            return error(res, "Name, email, and password are required", 400);
        }
        const user = await AuthService.register(req.body);
        success(res, user);

    }
    static async login(req = request, res = response) {

        const { user, token } = await AuthService.login(req.body);
        success(res, { user, token });

    }
    static async forgotPassword(req = request, res = response) {

        await AuthService.forgotPassword(req.body.email);
        success(res, "Password reset link sent to your email");

    }
    static async changePassword(req = request, res = response) {
       await AuthService.changePassword()

    }
}
export default AuthController;