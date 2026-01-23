import { Router } from "express";
import EventController from "../Controllers/EventController.js";
import { validateEventCreate, validateEventUpdate } from "../validators/eventValidators.js";
import { tryCatch } from "../Utils/try-catch.js";
import upload from "../Config/multer.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";
import { protectUser } from "../middleware/authMiddleware.js";


const Event = Router();
Event.post(
    "/", protectUser,
    upload.single("image"),        // 1. handle form-data first
    validateEventCreate,           // 2. then validate fields
    handleValidationErrors,
    tryCatch(EventController.create)
);
Event.get("/", protectUser, tryCatch(EventController.getAll));
Event.get("/:id", protectUser, tryCatch(EventController.getOne));
Event.put("/:id", protectUser, upload.single("image"), validateEventUpdate, handleValidationErrors, tryCatch(EventController.update));
Event.delete("/:id", protectUser, tryCatch(EventController.delete));

export default Event