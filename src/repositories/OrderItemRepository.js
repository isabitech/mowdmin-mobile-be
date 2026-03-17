let OrderItemModel;
const isMongo = process.env.DB_CONNECTION === "mongodb";

export const OrderItemRepository = {
  async getModel() {
    if (!OrderItemModel) {
      if (isMongo) {
        OrderItemModel = (await import("../MongoModels/OrderItemMongoModel.js"))
          .default;
      } else {
        OrderItemModel = (await import("../Models/OrderItemModel.js")).default;
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
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    if (isMongo) {
      return Model.find({}).skip(offset).limit(limit).lean();
    } else {
      return Model.findAll({ ...options, limit, offset });
    }
  },
  async findById(id, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.findById(id) : Model.findByPk(id, options);
  },
  async findAllByOrderId(orderId, options = {}) {
    const Model = await this.getModel();
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    if (isMongo) {
      const { limit: _limit, offset: _offset, ...mongoOptions } = options;
      return Model.find({ orderId, ...mongoOptions })
        .skip(offset)
        .limit(limit)
        .lean();
    }
    return Model.findAll({ where: { orderId }, ...options, limit, offset });
  },
  async updateById(id, payload, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findByIdAndUpdate(id, payload, { new: true });
    } else {
      return Model.update(payload, {
        where: { id },
        returning: true,
        ...options,
      });
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
