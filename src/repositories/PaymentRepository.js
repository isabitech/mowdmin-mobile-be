
let PaymentModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const PaymentRepository = {
  async getModel() {
    if (!PaymentModel) {
      if (isMongo) {
        PaymentModel = (await import('../MongoModels/PaymentMongoModel.js')).default;
      } else {
        PaymentModel = (await import('../Models/PaymentModel.js')).default;
      }
    }
    return PaymentModel;
  },

  async create(data) {
    const Model = await this.getModel();
    return Model.create(data);
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
  async findOne(where, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.findOne(where) : Model.findOne({ where, ...options });
  },
  async updateById(id, data, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findByIdAndUpdate(id, data, { new: true });
    } else {
      const payment = await Model.findByPk(id, options);
      if (!payment) return null;
      return payment.update(data);
    }
  },
  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      const payment = await Model.findByPk(id, options);
      if (!payment) return null;
      await payment.destroy();
      return true;
    }
  },
};
