import { body, param, validationResult } from "express-validator";
import { error } from  "../../Utils/helper.js";

export const validatePrayerRequestCreate = [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("isPublic").optional().isBoolean().withMessage("isPublic must be true or false"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return error(res, "Validation Error", errors.array());
        }
        next();
    },
];

export const validatePrayerRequestUpdate = [
    param("id").notEmpty().withMessage("Prayer Request ID is required"),
    body("title").optional().isString(),
    body("content").optional().isString(),
    body("isPublic").optional().isBoolean(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return error(res, "Validation Error", errors.array());
        }
        next();
    },
];
