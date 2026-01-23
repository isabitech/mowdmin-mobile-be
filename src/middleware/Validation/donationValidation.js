import { body } from "express-validator";
import User from "../../Models/UserModel.js";

export const validateDonation = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .bail()
    .custom(async (value) => {
      const user = await User.findByPk(value);
      if (!user) {
        throw new Error("Invalid user ID — user not found");
      }
      return true;
    }),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),

  body("currency")
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),

  body("status")
    .optional()
    .isIn(["pending", "success", "failed"])
    .withMessage("Invalid status value"),

  body("campaign")
    .optional()
    .isString()
    .trim()
    .escape(),

  body("transactionRef")
    .optional()
    .isString()
    .trim()
    .escape(),
];
