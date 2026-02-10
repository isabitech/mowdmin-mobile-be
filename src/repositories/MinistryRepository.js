import mongoose from 'mongoose';

let MinistryModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const MinistryRepository = {
    isValidId(id) {
        if (!isMongo) return true;
        return mongoose.Types.ObjectId.isValid(id);
    },
    async getModels() {
        if (!MinistryModel) {
            if (isMongo) {
                MinistryModel = (await import('../MongoModels/MinistryMongoModel.js')).default;
            } else {
                MinistryModel = (await import('../Models/MinistryModel.js')).default;
            }
        }
        return { MinistryModel };
    },

    async findAll(filters = {}) {
        const { MinistryModel } = await this.getModels();
        if (isMongo) return MinistryModel.find(filters);
        return MinistryModel.findAll({ where: filters });
    },

    async findById(id) {
        const { MinistryModel } = await this.getModels();
        if (isMongo) {
            if (!this.isValidId(id)) return null;
            return MinistryModel.findById(id);
        }
        return MinistryModel.findByPk(id);
    },

    async create(data) {
        const { MinistryModel } = await this.getModels();
        return MinistryModel.create(data);
    },
    async updateById(id, data) {
        const { MinistryModel } = await this.getModels();
        if (isMongo) {
            if (!this.isValidId(id)) return null;
            return await MinistryModel.findByIdAndUpdate(id, data, { new: true });
        }
        const ministry = await MinistryModel.findByPk(id);
        if (!ministry) return null;
        return ministry.update(data);
    },

    async deleteById(id) {
        const { MinistryModel } = await this.getModels();
        if (isMongo) {
            if (!this.isValidId(id)) return null;
            return await MinistryModel.findByIdAndDelete(id);
        }
        return await MinistryModel.destroy({ where: { id } });
    }
};
