let MinistryModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const MinistryRepository = {
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
        if (isMongo) return MinistryModel.findById(id);
        return MinistryModel.findByPk(id);
    },

    async create(data) {
        const { MinistryModel } = await this.getModels();
        return MinistryModel.create(data);
    }
};
