import { body } from "express-validator";
import { handleValidationErrors } from "../Validation/handleValidationErrors.js";

export const validateOrder = [
    body("userId")
        .notEmpty().withMessage("User ID is required")
        .isUUID().withMessage("Invalid User ID format"),

    body("totalAmount")
        .notEmpty().withMessage("Total amount is required")
        .isFloat({ gt: 0 }).withMessage("Total amount must be greater than 0"),

    body("status")
        .optional()
        .isIn(["pending", "completed", "cancelled"])
        .withMessage("Invalid order status"),

    handleValidationErrors,
];
