import Notification from "../Models/NotificationModel.js";

class NotificationService {
  async create(userId, title, message, type = "info", metadata = {}) {
    return await Notification.create({
      userId,
      title,
      message,
      type,
      metadata,
    });
  }

  async getUserNotifications(userId) {
    return await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }

  async markAsRead(notificationId) {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) return null;
    notification.isRead = true;
    await notification.save();
    return notification;
  }
}

export default new NotificationService();
