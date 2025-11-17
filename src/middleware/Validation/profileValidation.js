import { body, param } from "express-validator";

// Validate profile update data
export const validateProfileUpdate = [
    param("userId")
        .isUUID()
        .withMessage("User ID must be a valid UUID"),

    body("displayName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Display name must be between 2 and 100 characters"),

    body("bio")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Bio must be less than 500 characters"),

    body("location")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Location must be less than 100 characters"),

    body("phone_number")
        .optional()
        .trim()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage("Invalid phone number format"),

    body("birthdate")
        .optional()
        .isISO8601()
        .withMessage("Birthdate must be a valid date (YYYY-MM-DD)")
        .custom((value) => {
            const date = new Date(value);
            const now = new Date();
            const age = now.getFullYear() - date.getFullYear();
            
            if (age < 13 || age > 120) {
                throw new Error("Age must be between 13 and 120 years");
            }
            return true;
        }),
];

// Validate user ID parameter
export const validateUserId = [
    param("userId")
        .isUUID()
        .withMessage("User ID must be a valid UUID"),
];