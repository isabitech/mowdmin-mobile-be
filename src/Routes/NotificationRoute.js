import { Router } from "express";
import NotificationController from "../Controllers/NotificationController.js";
import { protectUser } from "../middleware/authMiddleware.js";

import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";

import { tryCatch } from "../Utils/try-catch.js";

const notification = Router();

notification.post(
	"/",
	protectUser,
	handleValidationErrors,
	tryCatch(NotificationController.create)
);
notification.get("/", protectUser, tryCatch(NotificationController.getUserNotifications));
notification.put("/:id/read", protectUser, tryCatch(NotificationController.markAsRead));

export default notification;
