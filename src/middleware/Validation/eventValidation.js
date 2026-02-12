import { body, param, validationResult } from "express-validator";
import { EventRepository } from "../../repositories/EventRepository.js";
import { sendValidationError } from "../../core/response.js";

// ---------------- CREATE EVENT VALIDATION ----------------
export const validateEventCreate = [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
    body("image").optional().isString(),
    body("date").notEmpty().isISO8601().withMessage("Date must be a valid format (YYYY-MM-DD)"),
    body("time")
        .notEmpty()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Time must be in HH:mm format"),
    body("location").notEmpty().withMessage("Location is required"),
    body("type")
        .isIn(["Crusade", "Baptism", "Communion", "Concert", "Seminar", "Online", "Tour", "Convention", "Conference", "Symposium"])
        .withMessage("Invalid event type"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, { statusCode: 400, errors: errors.array() });
        }
        next();
    },
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return sendValidationError(res, { statusCode: 400, errors: errors.array() });
    }
    next();
};


// ---------------- UPDATE EVENT VALIDATION ----------------
export const validateEventUpdate = [
    param("id")
        .notEmpty()
        .withMessage("Event ID is required")
        .bail()
        .custom(async (value) => {
            const event = await EventRepository.findById(value);
            if (!event) {
                throw new Error("Event not found");
            }
            return true;
        }),

    body("title").optional().isString().withMessage("Title must be a string"),
    body("description").optional().isString(),
    body("image").optional().isString(),
    body("date")
        .optional()
        .isISO8601()
        .withMessage("Date must be a valid ISO8601 date"),
    body("time").optional().isString().withMessage("Time must be a string"),
    body("location").optional().isString().withMessage("Location must be a string"),
    body("type")
        .optional()
        .isIn(["Crusade", "Baptism", "Communion", "Concert", "Seminar", "Online", "Tour", "Convention", "Conference", "Symposium"])
        .withMessage("Invalid event type"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, { statusCode: 400, errors: errors.array() });
        }
        next();
    },
];

