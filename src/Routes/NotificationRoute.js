import express from "express";
import NotificationController from "../Controllers/NotificationController.js";
import { createNotificationValidation } from "../middleware/Validation/NotificationValidation.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";
import { tryCatch } from "../Utils/try-catch.js";
import { protectUser } from "../middleware/authMiddleware.js";

const Notification = express.Router();

Notification.post("/", protectUser, createNotificationValidation, handleValidationErrors, tryCatch(NotificationController.create));

Notification.get("/", protectUser, tryCatch(NotificationController.getUserNotifications));

Notification.put("/:id/read", protectUser, tryCatch(NotificationController.markAsRead));

export default Notification;
