import mongoose from "mongoose";

let MinistryModel;
const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";
const DEFAULT_MINISTRY_PAGE_SIZE = 20;
const MAX_MINISTRY_PAGE_SIZE = 100;

export const MinistryRepository = {
  isValidId(id) {
    if (!getIsMongo()) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModels() {
    if (!MinistryModel) {
      if (getIsMongo()) {
        MinistryModel = (await import("../MongoModels/MinistryMongoModel.js"))
          .default;
      } else {
        MinistryModel = (await import("../Models/MinistryModel.js")).default;
      }
    }
    return { MinistryModel };
  },

  async findAll(filters = {}) {
    const { MinistryModel } = await this.getModels();
    const parsedLimit = Number.parseInt(filters.limit, 10);
    const parsedOffset = Number.parseInt(filters.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_MINISTRY_PAGE_SIZE)
        : DEFAULT_MINISTRY_PAGE_SIZE;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    const { limit: _limit, offset: _offset, ...where } = filters;

    if (getIsMongo())
      return MinistryModel.find(where).skip(offset).limit(limit).lean();
    return MinistryModel.findAll({ where, offset, limit });
  },

  async findById(id) {
    const { MinistryModel } = await this.getModels();
    if (getIsMongo()) {
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
    if (getIsMongo()) {
      if (!this.isValidId(id)) return null;
      return await MinistryModel.findByIdAndUpdate(id, data, { new: true });
    }
    const ministry = await MinistryModel.findByPk(id);
    if (!ministry) return null;
    return ministry.update(data);
  },

  async deleteById(id) {
    const { MinistryModel } = await this.getModels();
    if (getIsMongo()) {
      if (!this.isValidId(id)) return null;
      return await MinistryModel.findByIdAndDelete(id);
    }
    return await MinistryModel.destroy({ where: { id } });
  },
};
