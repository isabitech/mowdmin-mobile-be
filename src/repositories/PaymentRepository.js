// PaymentRepository.js
let PaymentModel;
let OrderModel;
let UserModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const PaymentRepository = {
  async getModels() {
    if (!PaymentModel || (!isMongo && (!OrderModel || !UserModel))) {
      if (isMongo) {
        PaymentModel = (await import('../MongoModels/PaymentMongoModel.js')).default;
        OrderModel = (await import('../MongoModels/OrderMongoModel.js')).default;
        UserModel = (await import('../MongoModels/UserMongoModel.js')).default;
      } else {
        PaymentModel = (await import('../Models/PaymentModel.js')).default;
        OrderModel = (await import('../Models/OrderModel.js')).default;
        UserModel = (await import('../Models/UserModel.js')).default;
      }
    }
    return { PaymentModel, OrderModel, UserModel };
  },

  async create(data) {
    const { PaymentModel } = await this.getModels();
    return PaymentModel.create(data);
  },

  async findAll(options = {}) {
    const { PaymentModel, OrderModel, UserModel } = await this.getModels();
    if (isMongo) {
      return PaymentModel.find({})
        .populate('userId', 'name email')
        .populate('orderId');
    } else {
      return PaymentModel.findAll({
        ...options,
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          // Assuming default alias for order
          /* 
          {
              model: OrderModel,
              as: 'order'
          } 
          */
        ]
      });
    }
  },

  async findById(id, options = {}) {
    const { PaymentModel, UserModel } = await this.getModels();
    return isMongo
      ? PaymentModel.findById(id).populate('userId', 'name email').populate('orderId')
      : PaymentModel.findByPk(id, {
        ...options,
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
  },

  async findOne(where, options = {}) {
    const { PaymentModel, UserModel } = await this.getModels();
    return isMongo
      ? PaymentModel.findOne(where)
      : PaymentModel.findOne({
        where,
        ...options,
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
  },

  async updateById(id, data, options = {}) {
    const { PaymentModel } = await this.getModels();
    if (isMongo) {
      return PaymentModel.findByIdAndUpdate(id, data, { new: true });
    } else {
      const payment = await PaymentModel.findByPk(id, options);
      if (!payment) return null;
      return payment.update(data);
    }
  },

  async deleteById(id, options = {}) {
    const { PaymentModel } = await this.getModels();
    if (isMongo) {
      const result = await PaymentModel.findByIdAndDelete(id);
      return !!result;
    } else {
      const payment = await PaymentModel.findByPk(id, options);
      if (!payment) return null;
      await payment.destroy();
      return true;
    }
  },
};
