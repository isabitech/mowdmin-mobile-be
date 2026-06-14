import NotificationService from "../Services/NotificationService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { paginate } from "../Utils/helper.js";

class NotificationController {
  async create(req, res) {
    const notificationSummary = await NotificationService.createByAdmin(
      req.body,
    );

    return sendSuccess(res, {
      message: "Notification created successfully",
      data: notificationSummary,
      statusCode: 201,
    });
  }

  async getUserNotifications(req, res) {
    const userId = req.user?.id;
    const { page, limit: pageSize } = req.query;
    const pagination = paginate(page || 1, pageSize);
    const notifications = await NotificationService.getUserNotifications(
      userId,
      pagination,
    );

    return sendSuccess(res, {
      message: "Notifications fetched successfully",
      data: notifications,
    });
  }

  async markAsRead(req, res) {
    const notificationId = req.params.notificationId || req.params.id;
    const userId = req.user?.id;
    const notification = await NotificationService.markAsRead(
      notificationId,
      userId,
    );

    if (!notification) {
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    }

    return sendSuccess(res, {
      message: "Notification marked as read",
      data: notification,
    });
  }

  async getPreferences(req, res) {
    const userId = req.user?.id;
    const preferences = await NotificationService.getUserPreferences(userId);

    return sendSuccess(res, {
      message: "Notification preferences fetched successfully",
      data: preferences,
    });
  }

  async updatePreferences(req, res) {
    const userId = req.user?.id;
    const preferences = await NotificationService.updateUserPreferences(
      userId,
      req.body,
    );

    return sendSuccess(res, {
      message: "Notification preferences updated successfully",
      data: preferences,
    });
  }

  async registerDevice(req, res) {
    const userId = req.user?.id;
    const device = await NotificationService.registerDevice(userId, req.body);

    return sendSuccess(res, {
      message: "Device token registered successfully",
      data: device,
    });
  }

  async unregisterDevice(req, res) {
    const userId = req.user?.id;
    await NotificationService.unregisterDevice(userId, req.body.token);

    return sendSuccess(res, {
      message: "Device token unregistered successfully",
      data: {},
    });
  }
}

export default new NotificationController();
