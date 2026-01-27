import { body, param, validationResult } from "express-validator";
import Media from "../../Models/MediaModel.js";
import { sendValidationError } from "../../core/response.js";

// ---------------- CREATE MEDIA VALIDATION ----------------
export const validateMediaCreate = [
    body("title").notEmpty().withMessage("Title is required"),
    body("type").isIn(["image", "video", "audio", "document"]).withMessage("Invalid media type"),
    body("url").notEmpty().isURL().withMessage("Valid media URL is required"),
    body("categoryId").optional().isUUID().withMessage("Invalid category ID format"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, { statusCode: 400, errors: errors.array() });
        }
        next();
    },
];

// ---------------- UPDATE MEDIA VALIDATION ----------------
export const validateMediaUpdate = [
    param("id")
        .notEmpty()
        .withMessage("Media ID is required")
        .bail()
        .custom(async (value) => {
            const media = await Media.findByPk(value);
            if (!media) throw new Error("Media not found");
            return true;
        }),
    body("title").optional().isString().withMessage("Title must be a string"),
    body("type").optional().isIn(["image", "video", "audio", "document"]).withMessage("Invalid media type"),
    body("url").optional().isURL().withMessage("URL must be valid"),
    body("categoryId").optional().isUUID().withMessage("Invalid category ID format"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, { statusCode: 400, errors: errors.array() });
        }
        next();
    },
];
