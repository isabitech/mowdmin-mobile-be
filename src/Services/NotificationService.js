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
    return NotificationRepository.markAsReadByUserId(notificationId, userId);
  }
}

export default new NotificationService();
