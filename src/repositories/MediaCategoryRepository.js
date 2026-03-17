let MediaCategoryModel;
const isMongo = process.env.DB_CONNECTION === "mongodb";
import mongoose from "mongoose";

export const MediaCategoryRepository = {
  isValidId(id) {
    if (!isMongo) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModel() {
    if (!MediaCategoryModel) {
      if (isMongo) {
        MediaCategoryModel = (
          await import("../MongoModels/MediaCategoryMongoModel.js")
        ).default;
      } else {
        MediaCategoryModel = (await import("../Models/MediaCategory.js"))
          .default;
      }
    }
    return MediaCategoryModel;
  },

  async create(payload) {
    const Model = await this.getModel();
    return Model.create(payload);
  },
  async findAll(options = {}) {
    const Model = await this.getModel();
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    if (isMongo) {
      const {
        where,
        order,
        include,
        limit: _limit,
        offset: _offset,
        ...rawFilter
      } = options;
      const filter = where || rawFilter;
      return Model.find(filter).skip(offset).limit(limit).lean();
    } else {
      return Model.findAll({ ...options, limit, offset });
    }
  },

  async findOne(options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.findOne(options) : Model.findOne({ where: options });
  },
  async findById(id) {
    const Model = await this.getModel();
    return isMongo ? Model.findById(id) : Model.findByPk(id);
  },
  async updateById(id, payload) {
    const Model = await this.getModel();
    if (isMongo) {
      if (!this.isValidId(id)) return null;
      return Model.findByIdAndUpdate(id, payload, { new: true });
    } else {
      const category = await Model.findByPk(id);
      if (!category) return null;
      return category.update(payload);
    }
  },
  async deleteById(id) {
    const Model = await this.getModel();
    if (isMongo) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      return Model.destroy({ where: { id } });
    }
  },
};
