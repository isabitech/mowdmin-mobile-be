import { body, param, validationResult } from "express-validator";
import { sendValidationError } from "../../core/response.js";
import Joi from "joi";
import { MediaRepository } from "../../repositories/MediaRepository.js";
import { MediaBookmarkRepository } from "../../repositories/MediaBookmarkRepository.js";

// ---------------- CREATE MEDIA BOOKMARK VALIDATION ----------------
export const validateMediaBookmarkCreate = [
    body("mediaId")
        .notEmpty()
        .withMessage("Media ID is required")
        .bail()
        .custom(async (value) => {
            const media = await MediaRepository.findById(value);
            if (!media) throw new Error("Media not found");
            return true;
        }),
    // body("userId").notEmpty().isUUID().withMessage("User ID is required and must be a valid UUID"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, { statusCode: 400, errors: errors.array() });
        }
        next();
    },
];

// ---------------- DELETE MEDIA BOOKMARK VALIDATION ----------------
export const validateMediaBookmarkDelete = [
    param("id")
        .notEmpty()
        .withMessage("Bookmark ID is required")
        .bail()
        .custom(async (value) => {
            const bookmark = await MediaBookmarkRepository.findById(value);
            if (!bookmark) throw new Error("Bookmark not found");
            return true;
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, { statusCode: 400, errors: errors.array() });
        }
        next();
    },
];

// ---------------- UPDATE MEDIA BOOKMARK VALIDATION ----------------
export const validateMediaBookmarkUpdate = [
    param("id")
        .notEmpty()
        .withMessage("Bookmark ID is required")
        .bail()
        .custom(async (value) => {
            const bookmark = await MediaBookmarkRepository.findById(value);
            if (!bookmark) throw new Error("Bookmark not found");
            return true;
        }),
    body("mediaId")
        .optional()
        .custom(async (value) => {
            const media = await MediaRepository.findById(value);
            if (!media) throw new Error("Media not found");
            return true;
        }),
    body("userId").optional().isUUID().withMessage("User ID must be a valid UUID"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, { statusCode: 400, errors: errors.array() });
        }
        next();
    },
];

// Joi validators (used by some controllers/services)
export const validateCreateMediaBookmark = (payload) =>
    Joi.object({
        userId: Joi.string(),
        mediaId: Joi.string().required(),
    })
        .prefs({ stripUnknown: true })
        .validate(payload);

export const validateUpdateMediaBookmark = (payload) =>
    Joi.object({
        userId: Joi.string(),
        mediaId: Joi.string(),
    })
        .prefs({ stripUnknown: true })
        .validate(payload);

export const middlewareValidateCreateMediaBookmark = (req, res, next) => {
    const { error } = validateCreateMediaBookmark(req.body);
    if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
    next();
};

export const middlewareValidateUpdateMediaBookmark = (req, res, next) => {
    const { error } = validateUpdateMediaBookmark(req.body);
    if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
    next();
};
