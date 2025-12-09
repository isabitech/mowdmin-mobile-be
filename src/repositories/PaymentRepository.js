import Payment from "../Models/PaymentModel.js";

export const PaymentRepository = {
  create: (data) => Payment.create(data),
  findAll: (options = {}) => Payment.findAll(options),
  findById: (id, options = {}) => Payment.findByPk(id, options),
  findOne: (where, options = {}) => Payment.findOne({ where, ...options }),
  updateById: async (id, data, options = {}) => {
    const payment = await Payment.findByPk(id, options);
    if (!payment) return null;
    return payment.update(data);
  },
  deleteById: async (id, options = {}) => {
    const payment = await Payment.findByPk(id, options);
    if (!payment) return null;
    await payment.destroy();
    return true;
  },
};
