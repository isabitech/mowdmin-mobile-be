import mongoose from 'mongoose';

let PrayerLikeModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const PrayerLikeRepository = {
    isValidId(id) {
        if (!isMongo) return true;
        return mongoose.Types.ObjectId.isValid(id);
    },
    async getModel() {
        if (!PrayerLikeModel) {
            if (isMongo) {
                PrayerLikeModel = (await import('../MongoModels/PrayerLikeMongoModel.js')).default;
            } else {
                PrayerLikeModel = (await import('../Models/PrayerLikeModel.js')).default;
            }
        }
        return PrayerLikeModel;
    },

    async toggleLike(prayerId, userId) {
        const Model = await this.getModel();
        if (isMongo) {
            const existing = await Model.findOne({ prayerId, userId });
            if (existing) {
                await Model.deleteOne({ _id: existing._id });
                return { liked: false };
            } else {
                await Model.create({ prayerId, userId });
                return { liked: true };
            }
        } else {
            const existing = await Model.findOne({ where: { prayerId, userId } });
            if (existing) {
                await Model.destroy({ where: { id: existing.id } });
                return { liked: false };
            } else {
                await Model.create({ prayerId, userId });
                return { liked: true };
            }
        }
    },

    async findOne(prayerId, userId) {
        const Model = await this.getModel();
        if (isMongo) {
            return Model.findOne({ prayerId, userId });
        }
        return Model.findOne({ where: { prayerId, userId } });
    },

    async findAllByUserId(userId, { limit = 20, offset = 0 } = {}) {
        const Model = await this.getModel();
        if (isMongo) {
            return Model.find({ userId }).populate('prayerId').sort({ createdAt: -1 }).skip(offset).limit(limit);
        }
        const PrayerModel = (await import('../Models/PrayerModel.js')).default;
        return Model.findAll({
            where: { userId },
            include: [{ model: PrayerModel, as: 'prayer' }],
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
};
