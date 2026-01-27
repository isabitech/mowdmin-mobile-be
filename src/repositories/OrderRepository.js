// OrderRepository.js
let OrderModel;
let UserModel;
let OrderItemModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const OrderRepository = {
    async getModels() {
        if (!OrderModel || (!isMongo && (!UserModel || !OrderItemModel))) {
            if (isMongo) {
                OrderModel = (await import('../MongoModels/OrderMongoModel.js')).default;
                UserModel = (await import('../MongoModels/UserMongoModel.js')).default;
                OrderItemModel = (await import('../MongoModels/OrderItemMongoModel.js')).default;
            } else {
                OrderModel = (await import('../Models/OrderModel.js')).default;
                UserModel = (await import('../Models/UserModel.js')).default;
                OrderItemModel = (await import('../Models/OrderItemModel.js')).default;
            }
        }
        return { OrderModel, UserModel, OrderItemModel };
    },

    async create(data) {
        const { OrderModel } = await this.getModels();
        return OrderModel.create(data);
    },

    async findAll(options = {}) {
        const { OrderModel, UserModel, OrderItemModel } = await this.getModels();

        if (isMongo) {
            return OrderModel.find({})
                .populate('userId', 'name email')
                .populate('items'); // Assuming items is the field name for order items in Mongo schema
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

        if (isMongo) {
            return OrderModel.findById(id)
                .populate('userId', 'name email')
                .populate('items');
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

        if (isMongo) {
            return OrderModel.find({ userId, ...options });
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
        if (isMongo) {
            return OrderModel.findByIdAndUpdate(id, data, { new: true });
        } else {
            const order = await OrderModel.findByPk(id, options);
            if (!order) return null;
            return order.update(data);
        }
    },

    async deleteById(id, options = {}) {
        const { OrderModel } = await this.getModels();
        if (isMongo) {
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
