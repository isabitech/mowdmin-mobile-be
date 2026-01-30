import { Router } from "express";
import EventController from "../Controllers/EventController.js";
import { validateEventCreate, validateEventUpdate } from "../middleware/Validation/eventValidation.js";
import { tryCatch } from "../Utils/try-catch.js";
import upload from "../Config/multer.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";


const Event = Router();

const createEventPipeline = [
    protectUser,
    protectAdmin,
    upload.single("image"),        // 1. handle form-data first
    validateEventCreate,           // 2. then validate fields
    handleValidationErrors,
    tryCatch(EventController.create),
];

// Backward-compatible create endpoint
Event.post(
    "/create",
    ...createEventPipeline
);

// Alias so clients can POST /api/v1/event/
Event.post(
    "/",
    ...createEventPipeline
);
Event.get("/", protectUser, tryCatch(EventController.getAll));
Event.get("/:id", protectUser, tryCatch(EventController.getOne));
Event.put("/:id", protectUser, protectAdmin, upload.single("image"), validateEventUpdate, handleValidationErrors, tryCatch(EventController.update));
Event.delete("/:id", protectUser, protectAdmin, tryCatch(EventController.delete));

export default Event