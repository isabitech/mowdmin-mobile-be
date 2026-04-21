// PaymentRepository.js
let PaymentModel;
let OrderModel;
let UserModel;

const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";

export const PaymentRepository = {
  async getModels() {
    if (!PaymentModel || (!getIsMongo() && (!OrderModel || !UserModel))) {
      if (getIsMongo()) {
        PaymentModel = (await import("../MongoModels/PaymentMongoModel.js"))
          .default;
        OrderModel = (await import("../MongoModels/OrderMongoModel.js"))
          .default;
        UserModel = (await import("../MongoModels/UserMongoModel.js")).default;
      } else {
        PaymentModel = (await import("../Models/PaymentModel.js")).default;
        OrderModel = (await import("../Models/OrderModel.js")).default;
        UserModel = (await import("../Models/UserModel.js")).default;
      }
    }
    return { PaymentModel, OrderModel, UserModel };
  },

  async createPayment(data) {
    const { PaymentModel } = await this.getModels();
    if (!getIsMongo() && data?.transactionRef && !data.reference) {
      data = { ...data, reference: data.transactionRef };
    }
    return PaymentModel.create(data);
  },

  async getAllPaymentsWithPagination(filters = {}) {
    const { PaymentModel, UserModel } = await this.getModels();
    const { page = 1, limit = 10, type, status } = filters;
    const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(Number.parseInt(limit, 10) || 10, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    if (getIsMongo()) {
      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;

      const items = await PaymentModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .populate("userId", "name email")
        .lean();

      // Keep exact counts for financial records; only skip count on trivial first page.
      const total =
        parsedPage === 1 && items.length < parsedLimit
          ? items.length
          : await PaymentModel.countDocuments(query);

      return {
        items,
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      };
    } else {
      const where = {};
      if (type) where.type = type;
      if (status) where.status = status;

      const { rows, count } = await PaymentModel.findAndCountAll({
        where,
        order: [["createdAt", "DESC"]],
        offset: skip,
        limit: parseInt(limit),
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      return {
        items: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      };
    }
  },

  async getPaymentById(id) {
    const { PaymentModel, UserModel } = await this.getModels();
    if (getIsMongo()) {
      return PaymentModel.findById(id).populate("userId", "name email");
    } else {
      return PaymentModel.findByPk(id, {
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      });
    }
  },

  async findByPaymentIntentId(paymentIntentId) {
    const { PaymentModel } = await this.getModels();
    return getIsMongo()
      ? PaymentModel.findOne({ paymentIntentId })
      : PaymentModel.findOne({ where: { paymentIntentId } });
  },

  async findByWebhookEventId(webhookEventId) {
    const { PaymentModel } = await this.getModels();
    return getIsMongo()
      ? PaymentModel.findOne({ webhookEventId })
      : PaymentModel.findOne({ where: { webhookEventId } });
  },

  async updatePaymentStatus(id, status, extraData = {}) {
    const { PaymentModel } = await this.getModels();
    const updateData = { status, ...extraData };

    if (getIsMongo()) {
      return PaymentModel.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const payment = await PaymentModel.findByPk(id);
      if (!payment) return null;
      return payment.update(updateData);
    }
  },

  async deleteById(id) {
    const { PaymentModel } = await this.getModels();
    if (getIsMongo()) {
      return PaymentModel.findByIdAndDelete(id);
    } else {
      const payment = await PaymentModel.findByPk(id);
      if (!payment) return null;
      await payment.destroy();
      return true;
    }
  },
};
