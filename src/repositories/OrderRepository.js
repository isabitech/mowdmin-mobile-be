import mongoose from 'mongoose';
// OrderRepository.js
let OrderModel;
let UserModel;
let OrderItemModel;

const getIsMongo = () => process.env.DB_CONNECTION === 'mongodb';

export const OrderRepository = {
    async getModels() {
        if (!OrderModel || (!getIsMongo() && (!UserModel || !OrderItemModel))) {
            if (getIsMongo()) {
                OrderModel = (await import('../MongoModels/OrderMongoModel.js')).default;
                UserModel = (await import('../MongoModels/UserMongoModel.js')).default;
                OrderItemModel = (await import('../MongoModels/OrderItemMongoModel.js')).default;
                // Ensure Product model is registered for population
                await import('../MongoModels/ProductMongoModel.js');
            } else {
                OrderModel = (await import('../Models/OrderModel.js')).default;
                UserModel = (await import('../Models/UserModel.js')).default;
                OrderItemModel = (await import('../Models/OrderItemModel.js')).default;
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
                const createdItemIds = [];
                for (const item of items) {
                    const orderItem = await OrderItemModel.create({
                        ...item,
                        orderId: order._id,
                        price: item.price || 0 // Default to 0 if price not provided
                    });
                    createdItemIds.push(orderItem._id);
                }

                // Update the order with item IDs
                order.items = createdItemIds;
                await order.save();
            }
            return order;
        }
        return OrderModel.create(data);
    },

    async findAll(options = {}) {
        const { OrderModel, UserModel, OrderItemModel } = await this.getModels();

        if (getIsMongo()) {
            return OrderModel.find({})
                .populate('userId', 'name email')
                .populate({
                    path: 'items',
                    populate: {
                        path: 'productId',
                        model: 'ProductMongo'
                    }
                }); // Deep populate product child information
        } else {
            return OrderModel.findAll({
                ...options,
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    // We might need to handle the association alias for OrderItems if it's not default
                    // Usually hasMany defaults to table name or 'OrderItems'
                    // Checking association.js or assumption: standard alias
                ]
            });
        }
    },

    async findById(id, options = {}) {
        const { OrderModel, UserModel, OrderItemModel } = await this.getModels();

        if (getIsMongo()) {
            return OrderModel.findById(id)
                .populate('userId', 'name email')
                .populate({
                    path: 'items',
                    populate: {
                        path: 'productId',
                        model: 'ProductMongo'
                    }
                });
        } else {
            return OrderModel.findByPk(id, {
                ...options,
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                ]
            });
        }
    },

    async findAllByUserId(userId, options = {}) {
        const { OrderModel, UserModel } = await this.getModels();

        if (getIsMongo()) {
            console.log("OrderRepository: Finding orders for userId:", userId);
            const queryUserId = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : userId;
            // Strip out Sequelize-specific options like 'include', 'order', 'where'
            const { include, order, where, ...mongoOptions } = options;
            const orders = await OrderModel.find({ userId: queryUserId, ...mongoOptions })
                .populate('userId', 'name email')
                .populate({
                    path: 'items',
                    populate: {
                        path: 'productId',
                        model: 'ProductMongo'
                    }
                })
                .sort({ createdAt: -1 }); // Default to latest first for orders
            return orders;
        } else {
            return OrderModel.findAll({
                where: { userId },
                ...options,
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });
        }
    },

    async updateById(id, data, options = {}) {
        const { OrderModel } = await this.getModels();
        if (getIsMongo()) {
            return OrderModel.findByIdAndUpdate(id, data, { new: true })
                .populate('userId', 'name email')
                .populate({
                    path: 'items',
                    populate: {
                        path: 'productId',
                        model: 'ProductMongo'
                    }
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
