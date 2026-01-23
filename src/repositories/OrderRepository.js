
let OrderModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const OrderRepository = {
    async getModel() {
        if (!OrderModel) {
            if (isMongo) {
                OrderModel = (await import('../MongoModels/OrderMongoModel.js')).default;
            } else {
                OrderModel = (await import('../Models/OrderModel.js')).default;
            }
        }
        return OrderModel;
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
    async findAllByUserId(userId, options = {}) {
        const Model = await this.getModel();
        return isMongo ? Model.find({ userId, ...options }) : Model.findAll({ where: { userId }, ...options });
    },
    async updateById(id, data, options = {}) {
        const Model = await this.getModel();
        if (isMongo) {
            return Model.findByIdAndUpdate(id, data, { new: true });
        } else {
            const order = await Model.findByPk(id, options);
            if (!order) return null;
            return order.update(data);
        }
    },
    async deleteById(id, options = {}) {
        const Model = await this.getModel();
        if (isMongo) {
            const result = await Model.findByIdAndDelete(id);
            return !!result;
        } else {
            const order = await Model.findByPk(id, options);
            if (!order) return null;
            await order.destroy();
            return true;
        }
    },
};
