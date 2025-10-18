import { body } from "express-validator";
import {handleValidationErrors}  from "../Validation/handleValidationErrors.js";

export const validatePayment = [
  body("orderId")
    .notEmpty().withMessage("Order ID is required")
    .isUUID().withMessage("Invalid Order ID format"),

  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),

  body("method")
    .notEmpty().withMessage("Payment method is required")
    .isIn(["card", "bank_transfer", "wallet", "crypto"])
    .withMessage("Invalid payment method"),

  body("status")
    .optional()
    .isIn(["pending", "successful", "failed"])
    .withMessage("Invalid payment status"),

  handleValidationErrors,
];
