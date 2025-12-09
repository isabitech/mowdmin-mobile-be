import { NotificationRepository } from "../repositories/NotificationRepository.js";

class NotificationService {
  async create(userId, title, message, type = "info", metadata = {}) {
    return await NotificationRepository.create({
      userId,
      title,
      message,
      type,
      metadata,
    });
  }

  async getUserNotifications(userId) {
    return await NotificationRepository.findAllByUserId(userId);
  }

  async markAsRead(notificationId) {
    const notification = await NotificationRepository.findById(notificationId);
    if (!notification) return null;
    notification.isRead = true;
    await notification.save();
    return notification;
  }
}

export default new NotificationService();
