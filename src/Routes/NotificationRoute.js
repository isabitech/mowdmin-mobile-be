import { Router } from "express";
import NotificationController from "../Controllers/NotificationController.js";
import { protectAdmin, protectUser } from "../middleware/authMiddleware.js";
import {
  middlewareValidateCreateNotification,
  middlewareValidateNotificationDeviceRegistration,
  middlewareValidateNotificationDeviceUnregistration,
  middlewareValidateNotificationPreferencesUpdate,
} from "../middleware/Validation/NotificationValidation.js";
import { tryCatch } from "../Utils/try-catch.js";

const notification = Router();

notification.post(
  "/create",
  protectUser,
  protectAdmin,
  middlewareValidateCreateNotification,
  tryCatch(NotificationController.create),
);

notification.get(
  "/preferences",
  protectUser,
  tryCatch(NotificationController.getPreferences),
);

notification.put(
  "/preferences",
  protectUser,
  middlewareValidateNotificationPreferencesUpdate,
  tryCatch(NotificationController.updatePreferences),
);

notification.post(
  "/devices/register",
  protectUser,
  middlewareValidateNotificationDeviceRegistration,
  tryCatch(NotificationController.registerDevice),
);

notification.post(
  "/devices/unregister",
  protectUser,
  middlewareValidateNotificationDeviceUnregistration,
  tryCatch(NotificationController.unregisterDevice),
);

notification.get(
  "/",
  protectUser,
  tryCatch(NotificationController.getUserNotifications),
);

notification.put(
  "/:notificationId/read",
  protectUser,
  tryCatch(NotificationController.markAsRead),
);

export default notification;
