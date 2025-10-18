import { body, param, validationResult } from "express-validator";
import MediaBookmark from "../../Models/MediaBookmarksModel.js";
import Media from "../../Models/MediaModel.js";

// ---------------- CREATE MEDIA BOOKMARK VALIDATION ----------------
export const validateMediaBookmarkCreate = [
    body("mediaId")
        .notEmpty()
        .withMessage("Media ID is required")
        .bail()
        .custom(async (value) => {
            const media = await Media.findByPk(value);
            if (!media) throw new Error("Media not found");
            return true;
        }),
    body("userId").notEmpty().isUUID().withMessage("User ID is required and must be a valid UUID"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
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
            const bookmark = await MediaBookmark.findByPk(value);
            if (!bookmark) throw new Error("Bookmark not found");
            return true;
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    },
];
