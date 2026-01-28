import { Router } from "express";
import EventRegistrationController from "../Controllers/EventRegistration.js";
import { tryCatch } from "../Utils/try-catch.js";
import { protectUser ,protectAdmin} from "../middleware/authMiddleware.js";
import { validateEventRegistration } from "../middleware/Validation/eventRegistrationValidation.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";

const registration = Router();

// Create a new registration
registration.post(
    "/register",
    protectUser,
    validateEventRegistration,
    handleValidationErrors,
    tryCatch(EventRegistrationController.create)
);

// Get all registrations (admin or global)
registration.get(
    "/",
    protectUser,
    protectAdmin,
    tryCatch(EventRegistrationController.GetAll)
);

// Get all registrations for a specific event
registration.get(
    "/event/:eventId",
    protectUser,
    tryCatch(EventRegistrationController.GetAllByEventId)
);

// Get all registrations by a specific user
registration.get(
    "/user",
    protectUser,
    tryCatch(EventRegistrationController.GetAllByUser)
);

// Get a single registration by ID
registration.get(
    "/:id",
    protectUser,
    tryCatch(EventRegistrationController.GetById)
);

// Update a registration (e.g. mark attended)
registration.put(
    "/:id",
    protectUser,
    tryCatch(EventRegistrationController.Update)
);

// Delete a registration
registration.delete(
    "/:id",
    protectUser,
    protectAdmin,
    tryCatch(EventRegistrationController.Delete)
);

export default registration;
