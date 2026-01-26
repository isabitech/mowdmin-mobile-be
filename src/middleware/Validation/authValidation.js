import { body, validationResult } from "express-validator";
import User from "../../Models/UserModel.js";
// ✅ Password complexity regex
export const validatePassword = (password) => {
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  return re.test(String(password));
};

// ✅ Express-validator rules for registration
export const validateUserRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

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

// ✅ Express-validator rules for login
export const validateUserLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .custom(async (email) => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("No account found with this email");
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom((value) => {
      if (!validatePassword(value)) {
        throw new Error(
          "Password must include uppercase, lowercase, number, and special character"
        );
      }
      return true;
    }),
];

// ✅ Forgot password validation
export const validateForgotPassword = [
  body("email")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (email) => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("Email not found");
    }),
];

// ✅ Reset password validation
export const validateResetPassword = [
  body("email")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (email) => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("Email not found");
    }),
  body("otp")
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage("OTP must be a 4-digit number"),
  body("newPassword")
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
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),
];

// ✅ Email verification validation
export const validateEmailVerification = [
  body("email")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (email) => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("Email not found");
      if (user.emailVerified) throw new Error("Email is already verified");
    }),
  body("otp")
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage("OTP must be a 4-digit number"),
];

// ✅ Resend verification validation
export const validateResendVerification = [
  body("email")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (email) => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("Email not found");
      if (user.emailVerified) throw new Error("Email is already verified");
    }),
];
// middleware to check validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};