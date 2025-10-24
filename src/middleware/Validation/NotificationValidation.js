import { body } from "express-validator";

export const createNotificationValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("message").notEmpty().withMessage("Message is required"),
  body("type")
    .optional()
    .isIn(["info", "alert", "transaction", "system"])
    .withMessage("Invalid type"),
];
