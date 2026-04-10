import mongoose from "mongoose";
// OrderRepository.js
let OrderModel;
let UserModel;
let OrderItemModel;

const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";
const DEFAULT_ORDER_PAGE_SIZE = 20;
const MAX_ORDER_PAGE_SIZE = 100;

const getPaginationOptions = (options = {}) => {
  const parsedLimit = Number.parseInt(options.limit, 10);
  const parsedOffset = Number.parseInt(options.offset, 10);
  return {
    limit:
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_ORDER_PAGE_SIZE)
        : DEFAULT_ORDER_PAGE_SIZE,
    offset:
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0,
  };
};

export const OrderRepository = {
  async getModels() {
    if (!OrderModel || (!getIsMongo() && (!UserModel || !OrderItemModel))) {
      if (getIsMongo()) {
        OrderModel = (await import("../MongoModels/OrderMongoModel.js"))
          .default;
        UserModel = (await import("../MongoModels/UserMongoModel.js")).default;
        OrderItemModel = (await import("../MongoModels/OrderItemMongoModel.js"))
          .default;
        // Ensure Product model is registered for population
        await import("../MongoModels/ProductMongoModel.js");
      } else {
        OrderModel = (await import("../Models/OrderModel.js")).default;
        UserModel = (await import("../Models/UserModel.js")).default;
        OrderItemModel = (await import("../Models/OrderItemModel.js")).default;
      }
    }
    return { OrderModel, UserModel, OrderItemModel };
  },

  async create(data) {
    const { OrderModel, OrderItemModel } = await this.getModels();
    if (getIsMongo()) {
      const { items, ...orderData } = data;

      // Create the order first
      const order = await OrderModel.create(orderData);

      if (items && Array.isArray(items)) {
        try {
          const itemDocs = items.map((item) => ({
            ...item,
            orderId: order._id,
            price: item.price || 0,
          }));
          const createdItems = await OrderItemModel.insertMany(itemDocs);
          const createdItemIds = createdItems.map((item) => item._id);

          // Update the order with item IDs
          order.items = createdItemIds;
          await order.save();
        } catch (err) {
          await OrderModel.findByIdAndDelete(order._id);
          throw err;
        }
      }
      return order;
    }
    return OrderModel.create(data);
  },

  async findAll(options = {}) {
    const { OrderModel, UserModel, OrderItemModel } = await this.getModels();
    const { limit, offset } = getPaginationOptions(options);

    if (getIsMongo()) {
      let query = OrderModel.find({})
        .populate("userId", "name email")
        .populate({
          path: "items",
          populate: {
            path: "productId",
            model: "ProductMongo",
            select:
              "name description price category imageUrl stock createdAt updatedAt",
          },
        })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
      return query;
    } else {
      return OrderModel.findAll({
        ...options,
        limit,
        offset,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: ["id", "name", "email"],
          },
          // We might need to handle the association alias for OrderItems if it's not default
          // Usually hasMany defaults to table name or 'OrderItems'
          // Checking association.js or assumption: standard alias
        ],
      });
    }
  },

  async findById(id, options = {}) {
    const { OrderModel, UserModel, OrderItemModel } = await this.getModels();

    if (getIsMongo()) {
      return OrderModel.findById(id)
        .populate("userId", "name email")
        .populate({
          path: "items",
          populate: {
            path: "productId",
            model: "ProductMongo",
            select:
              "name description price category imageUrl stock createdAt updatedAt",
          },
        });
    } else {
      return OrderModel.findByPk(id, {
        ...options,
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

  async findAllByUserId(userId, options = {}) {
    const { OrderModel, UserModel } = await this.getModels();
    const { limit, offset } = getPaginationOptions(options);

    if (getIsMongo()) {
      const queryUserId = mongoose.isValidObjectId(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
      const { include, order, where, ...mongoOptions } = options;
      let query = OrderModel.find({ userId: queryUserId, ...mongoOptions })
        .populate("userId", "name email")
        .populate({
          path: "items",
          populate: {
            path: "productId",
            model: "ProductMongo",
            select:
              "name description price category imageUrl stock createdAt updatedAt",
          },
        })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
      return query;
    } else {
      return OrderModel.findAll({
        where: { userId },
        ...options,
        limit,
        offset,
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

  async updateById(id, data, options = {}) {
    const { OrderModel } = await this.getModels();
    if (getIsMongo()) {
      return OrderModel.findByIdAndUpdate(id, data, { new: true })
        .populate("userId", "name email")
        .populate({
          path: "items",
          populate: {
            path: "productId",
            model: "ProductMongo",
            select:
              "name description price category imageUrl stock createdAt updatedAt",
          },
        });
    } else {
      const order = await OrderModel.findByPk(id, options);
      if (!order) return null;
      return order.update(data);
    }
  },

  async deleteById(id, options = {}) {
    const { OrderModel } = await this.getModels();
    if (getIsMongo()) {
      const result = await OrderModel.findByIdAndDelete(id);
      return !!result;
    } else {
      const order = await OrderModel.findByPk(id, options);
      if (!order) return null;
      await order.destroy();
      return true;
    }
  },
};
