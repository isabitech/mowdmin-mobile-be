import NotificationService from "../Services/NotificationService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreateNotification } from "../middleware/Validation/NotificationValidation.js";

class NotificationController {
    async create(req, res) {
        const { error, value } = validateCreateNotification(req.body);
        if (error) {
            return sendError(res, { message: error.details[0].message, statusCode: 400 });
        }

        const userId = req.user?.id;
        const notification = await NotificationService.create(userId, value.title, value.message, value.type, value.metadata);
        return sendSuccess(res, { message: "Notification created successfully", data: notification, statusCode: 201 });
    }
    async getUserNotifications(req, res) {
        const userId = req.user?.id;
        const notifications = await NotificationService.getUserNotifications(userId);
        return sendSuccess(res, { message: "Notifications fetched successfully", data: notifications });
    }
    async markAsRead(req, res) {
        const { id } = req.params;
        const notification = await NotificationService.markAsRead(id);
        if (!notification) return sendError(res, { message: "Notification not found", statusCode: 404 });
        return sendSuccess(res, { message: "Notification marked as read", data: notification });

    }
}
export default new NotificationController();
