import { body, param, validationResult } from "express-validator";
import MediaCategory from "../../Models/MediaCategory.js";
import { sendValidationError } from "../../core/response.js";

// ---------------- CREATE MEDIA CATEGORY VALIDATION ----------------
export const validateMediaCategoryCreate = [
    body("name").notEmpty().withMessage("Category name is required"),
    body("description").optional().isString().withMessage("Description must be a string"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, { statusCode: 400, errors: errors.array() });
        }
        next();
    },
];

// ---------------- UPDATE MEDIA CATEGORY VALIDATION ----------------
export const validateMediaCategoryUpdate = [
    param("id")
        .notEmpty()
        .withMessage("Category ID is required")
        .bail()
        .custom(async (value) => {
            const category = await MediaCategory.findByPk(value);
            if (!category) throw new Error("Category not found");
            return true;
        }),
    body("name").optional().isString().withMessage("Name must be a string"),
    body("description").optional().isString().withMessage("Description must be a string"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, { statusCode: 400, errors: errors.array() });
        }
        next();
    },
];
