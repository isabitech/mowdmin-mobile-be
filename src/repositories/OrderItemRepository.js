
let OrderItemModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const OrderItemRepository = {
  async getModel() {
    if (!OrderItemModel) {
      if (isMongo) {
        OrderItemModel = (await import('../MongoModels/OrderItemMongoModel.js')).default;
      } else {
        OrderItemModel = (await import('../Models/OrderItemModel.js')).default;
      }
    }
    return OrderItemModel;
  },

  async create(payload) {
    const Model = await this.getModel();
    return Model.create(payload);
  },
  async findAll(options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.find({});
    } else {
      return Model.findAll(options);
    }
  },
  async findById(id, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.findById(id) : Model.findByPk(id, options);
  },
  async findAllByOrderId(orderId, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.find({ orderId, ...options }) : Model.findAll({ where: { orderId }, ...options });
  },
  async updateById(id, payload, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findByIdAndUpdate(id, payload, { new: true });
    } else {
      return Model.update(payload, { where: { id }, returning: true, ...options });
    }
  },
  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      return Model.destroy({ where: { id }, ...options });
    }
  },
};
