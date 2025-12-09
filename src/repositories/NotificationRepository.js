import Notification from "../Models/NotificationModel.js";

export const NotificationRepository = {
  create: (payload) => Notification.create(payload),
  findAllByUserId: (userId) => Notification.findAll({ where: { userId } }),
  findById: (id) => Notification.findByPk(id),
  updateById: (id, payload) => Notification.update(payload, { where: { id }, returning: true }),
};
