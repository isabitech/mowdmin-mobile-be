import { body } from "express-validator";
import { handleValidationErrors } from "./handleValidationErrors.js";

export const validateOrderItem = [
    body("orderId")
        .notEmpty().withMessage("Order ID is required")
        .isUUID().withMessage("Invalid Order ID format"),

    body("productId")
        .notEmpty().withMessage("Product ID is required")
        .isUUID().withMessage("Invalid Product ID format"),

    body("quantity")
        .notEmpty().withMessage("Quantity is required")
        .isInt({ gt: 0 }).withMessage("Quantity must be a positive integer"),

    body("price")
        .notEmpty().withMessage("Price is required")
        .isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),

    handleValidationErrors,
];
