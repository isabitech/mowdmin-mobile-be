import OrderItem from "../Models/OrderItemModel.js";

export const OrderItemRepository = {
  create: (payload) => OrderItem.create(payload),
  findAll: (options = {}) => OrderItem.findAll(options),
  findById: (id, options = {}) => OrderItem.findByPk(id, options),
  findAllByOrderId: (orderId, options = {}) =>
    OrderItem.findAll({ where: { orderId }, ...options }),
  updateById: (id, payload, options = {}) =>
    OrderItem.update(payload, { where: { id }, returning: true, ...options }),
  deleteById: (id, options = {}) => OrderItem.destroy({ where: { id }, ...options }),
};
