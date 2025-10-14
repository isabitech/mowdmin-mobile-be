import { request, response } from "express";
import AuthService from "../Services/AuthService.js";
import { success, error } from "../Utils/helper.js";

class AuthController {
    static async register(req = request, res = response) {
        try {
            const user = await AuthService.register(req.body);
            success(res, user);
        } catch (err) {
            error(res, err);
        }
    }
    static async login(req = request, res = response) {
        try {
            const { user, token } = await AuthService.login(req.body);
            success(res, { user, token });
        } catch (err) {
            error(res, err);
        }
    }
    static async forgotPassword(req = request, res = response) {
        try {
            await AuthService.forgotPassword(req.body.email);
            success(res, "Password reset link sent to your email");
        } catch (err) {
            error(res, err);
        }
    }
}
export default AuthController;