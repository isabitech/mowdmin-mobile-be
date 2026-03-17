import mongoose from "mongoose";
import { LRUCache } from "lru-cache";

let PrayerCommentModel;
const isMongo = process.env.DB_CONNECTION === "mongodb";
const COMMENT_COUNT_CACHE_TTL_MS = 15000;
const prayerCommentCountCache = new LRUCache({
  max: 1000,
  ttl: 60 * 1000,
  updateAgeOnGet: false,
});

export const PrayerCommentRepository = {
  isValidId(id) {
    if (!isMongo) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModel() {
    if (!PrayerCommentModel) {
      if (isMongo) {
        PrayerCommentModel = (
          await import("../MongoModels/PrayerCommentMongoModel.js")
        ).default;
      } else {
        PrayerCommentModel = (await import("../Models/PrayerCommentModel.js"))
          .default;
      }
    }
    return PrayerCommentModel;
  },

  async create(payload) {
    const Model = await this.getModel();
    const created = await Model.create(payload);
    if (isMongo && payload?.prayerId) {
      prayerCommentCountCache.delete(String(payload.prayerId));
    }
    return created;
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
      return Model.find({ prayerId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    }
    return Model.findAll({
      where: { prayerId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
  },

  async countByPrayerId(prayerId) {
    const Model = await this.getModel();
    if (isMongo) {
      const cacheKey = String(prayerId);
      const cached = prayerCommentCountCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }
      const count = await Model.countDocuments({ prayerId });
      prayerCommentCountCache.set(
        cacheKey,
        {
          value: count,
          expiresAt: Date.now() + COMMENT_COUNT_CACHE_TTL_MS,
        },
        { ttl: 60 * 1000 },
      );
      return count;
    }
    return Model.count({ where: { prayerId } });
  },

  async deleteById(id) {
    const Model = await this.getModel();
    if (isMongo) {
      if (!this.isValidId(id)) return false;
      const result = await Model.findByIdAndDelete(id);
      if (result?.prayerId) {
        prayerCommentCountCache.delete(String(result.prayerId));
      }
      return !!result;
    }
    const result = await Model.destroy({ where: { id } });
    return result > 0;
  },
};
