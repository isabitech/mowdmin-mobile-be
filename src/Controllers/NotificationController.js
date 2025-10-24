import NotificationService from "../Services/NotificationService.js";
import { success, error } from "../Utils/helper.js";

class NotificationController {
    async create(req, res) {

        const { title, message, type, metadata } = req.body;
        const userId = req.user?.id;
        const notification = await NotificationService.create(userId, title, message, type, metadata);
        return success(res, "Notification created successfully", notification);

    }

    async getUserNotifications(req, res) {

        const userId = req.user?.id;
        const notifications = await NotificationService.getUserNotifications(userId);
        return success(res, "Notifications fetched successfully", notifications);

    }

    async markAsRead(req, res) {

        const { id } = req.params;
        const notification = await NotificationService.markAsRead(id);
        if (!notification) return error(res, "Notification not found", 404);
        return success(res, "Notification marked as read", notification);

    }
}

export default new NotificationController();
