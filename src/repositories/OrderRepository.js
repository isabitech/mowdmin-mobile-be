import Order from "../Models/OrderModel.js";

export const OrderRepository = {
    create: (data) => Order.create(data),
    findAll: (options = {}) => Order.findAll(options),
    findById: (id, options = {}) => Order.findByPk(id, options),
    findAllByUserId: (userId, options = {}) =>
        Order.findAll({ where: { userId }, ...options }),
    updateById: async (id, data, options = {}) => {
        const order = await Order.findByPk(id, options);
        if (!order) return null;
        return order.update(data);
    },
    deleteById: async (id, options = {}) => {
        const order = await Order.findByPk(id, options);
        if (!order) return null;
        await order.destroy();
        return true;
    },
};
