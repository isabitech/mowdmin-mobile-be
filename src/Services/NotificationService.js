import { NotificationRepository } from "../repositories/NotificationRepository.js";

class NotificationService {
  async createNotification(...args) {
    return this.create(...args);
  }

  async create(userId, title, message, type = "info", metadata = {}) {
    return await NotificationRepository.create({
      userId,
      title,
      message,
      type,
      metadata,
    });
  }

  async getUserNotifications(userId, pagination = {}) {
    return await NotificationRepository.findAllByUserId(userId, pagination);
  }

  async markAsRead(notificationId, userId) {
    const notification = await NotificationRepository.findById(notificationId);
    if (!notification) return null;
    // Verify ownership
    const ownerId = notification.userId?._id || notification.userId;
    if (ownerId && ownerId.toString() !== userId.toString()) {
      return null;
    }
    notification.isRead = true;
    await notification.save();
    return notification;
  }
}

export default new NotificationService();
