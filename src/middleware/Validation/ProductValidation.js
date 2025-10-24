import { body, param, validationResult } from "express-validator";

import { error } from "../../Utils/helper.js";

export const validateProductCreate = [
  body("name").notEmpty().withMessage("Name is required"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .isNumeric()
    .withMessage("Category ID must be a number"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, "Validation failed", errors.array());
    }
    next();
  },
];

export const validateProductUpdate = [
  body("name").optional().isString().withMessage("Name must be a string"),
  body("price").optional().isNumeric().withMessage("Price must be a number"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("categoryId").optional().isNumeric().withMessage("Category ID must be a number"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", errors.array());
    }
    next();
  },
];
