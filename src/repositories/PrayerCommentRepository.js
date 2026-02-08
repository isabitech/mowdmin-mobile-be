import mongoose from 'mongoose';

let PrayerCommentModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const PrayerCommentRepository = {
    isValidId(id) {
        if (!isMongo) return true;
        return mongoose.Types.ObjectId.isValid(id);
    },
    async getModel() {
        if (!PrayerCommentModel) {
            if (isMongo) {
                PrayerCommentModel = (await import('../MongoModels/PrayerCommentMongoModel.js')).default;
            } else {
                PrayerCommentModel = (await import('../Models/PrayerCommentModel.js')).default;
            }
        }
        return PrayerCommentModel;
    },

    async create(payload) {
        const Model = await this.getModel();
        return Model.create(payload);
    },

    async findById(id) {
        const Model = await this.getModel();
        if (isMongo) {
            if (!this.isValidId(id)) return null;
            return Model.findById(id);
        }
        return Model.findByPk(id);
    },

    async findAllByPrayerId(prayerId, { limit = 10, offset = 0 } = {}) {
        const Model = await this.getModel();
        if (isMongo) {
            return Model.find({ prayerId }).sort({ createdAt: -1 }).skip(offset).limit(limit);
        }
        return Model.findAll({
            where: { prayerId },
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
    },

    async countByPrayerId(prayerId) {
        const Model = await this.getModel();
        if (isMongo) {
            return Model.countDocuments({ prayerId });
        }
        return Model.count({ where: { prayerId } });
    },

    async deleteById(id) {
        const Model = await this.getModel();
        if (isMongo) {
            if (!this.isValidId(id)) return false;
            const result = await Model.findByIdAndDelete(id);
            return !!result;
        }
        const result = await Model.destroy({ where: { id } });
        return result > 0;
    },
};
