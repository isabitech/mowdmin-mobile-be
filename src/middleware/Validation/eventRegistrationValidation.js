import { body } from "express-validator";
import Event from "../../Models/EventModel.js";
import User from "../../Models/UserModel.js";

/**
 * Validation rules for event registration creation.
 */
export const validateEventRegistration = [
    // Validate eventId
    body("eventId")
        .notEmpty()
        .withMessage("Event ID is required")
        .bail()
        .custom(async (value) => {
            const event = await Event.findByPk(value);
            if (!event) {
                throw new Error("Invalid event ID — event not found");
            }
            return true;
        }),

    // Validate userId
    // body("userId")
    //     .notEmpty()
    //     .withMessage("User ID is required")
    //     .bail()
    //     .custom(async (value) => {
    //         const user = await User.findByPk(value);
    //         if (!user) {
    //             throw new Error("Invalid user ID — user not found");
    //         }
    //         return true;
    //     }),

    // Optional ticketCode
    body("ticketCode")
        .optional()
        .isString()
        .withMessage("Ticket code must be a string"),

    // Validate status
    body("status")
        .optional()
        .isIn(["registered", "attended"])
        .withMessage("Status must be either 'registered' or 'attended'"),
];

