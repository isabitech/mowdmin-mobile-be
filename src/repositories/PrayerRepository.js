import mongoose from "mongoose";

let PrayerModel;
const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";

export const PrayerRepository = {
  isValidId(id) {
    if (!getIsMongo()) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModel() {
    if (!PrayerModel) {
      if (getIsMongo()) {
        PrayerModel = (await import("../MongoModels/PrayerMongoModel.js"))
          .default;
      } else {
        PrayerModel = (await import("../Models/PrayerModel.js")).default;
      }
    }
    return PrayerModel;
  },

  async create(payload) {
    const Model = await this.getModel();
    return Model.create(payload);
  },
  async findById(id, options = {}) {
    const Model = await this.getModel();
    if (getIsMongo()) {
      if (!this.isValidId(id)) return null;
      return Model.findById(id);
    }
    return Model.findByPk(id, options);
  },
  async findOne(where, options = {}) {
    const Model = await this.getModel();
    return getIsMongo()
      ? Model.findOne(where)
      : Model.findOne({ where, ...options });
  },
  async findAll(options = {}) {
    const Model = await this.getModel();
    if (getIsMongo()) {
      const filter = options.where || {};
      let query = Model.find(filter);
      if (options.order) {
        const sort = {};
        options.order.forEach(([field, dir]) => {
          sort[field] = dir === "DESC" ? -1 : 1;
        });
        query = query.sort(sort);
      }
      if (options.limit) {
        query = query.limit(options.limit);
        if (options.offset) query = query.skip(options.offset);
      }
      return query.lean();
    } else {
      return Model.findAll(options);
    }
  },
  async updateById(id, payload, options = {}) {
    const Model = await this.getModel();
    if (getIsMongo()) {
      return Model.findByIdAndUpdate(id, payload, { new: true });
    } else {
      const res = await Model.findByPk(id, options);
      if (!res) return null;
      return res.update(payload);
    }
  },
  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (getIsMongo()) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      return Model.destroy({ where: { id }, ...options });
    }
  },
};
