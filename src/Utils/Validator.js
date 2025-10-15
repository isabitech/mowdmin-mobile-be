import { body, validationResult } from "express-validator";
import User from "../Models/UserModel.js"; 
// ✅ Password complexity regex
export const validatePassword = (password) => {
    const re =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return re.test(String(password));
};

// ✅ Express-validator rules
export const validateUser = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email format")
        .custom(async (value) => {
            const existing = await User.findOne({ where: { email: value } });
            if (existing) throw new Error("Email already exists");
        }),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .custom((value) => {
            if (!validatePassword(value)) {
                throw new Error(
                    "Password must include uppercase, lowercase, number, and special character"
                );
            }
            return true;
        }),
];

// ✅ Error handler helper (to use in controller)
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors.array()[0].msg,
        });
    }
    next();
};

