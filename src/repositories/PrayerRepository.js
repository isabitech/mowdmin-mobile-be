import mongoose from 'mongoose';

let PrayerModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const PrayerRepository = {
  isValidId(id) {
    if (!isMongo) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModel() {
    if (!PrayerModel) {
      if (isMongo) {
        PrayerModel = (await import('../MongoModels/PrayerMongoModel.js')).default;
      } else {
        PrayerModel = (await import('../Models/PrayerModel.js')).default;
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
    if (isMongo) {
      if (!this.isValidId(id)) return null;
      return Model.findById(id);
    }
    return Model.findByPk(id, options);
  },
  async findOne(where, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.findOne(where) : Model.findOne({ where, ...options });
  },
  async findAll(options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.find({});
    } else {
      return Model.findAll(options);
    }
  },
  async updateById(id, payload, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findByIdAndUpdate(id, payload, { new: true });
    } else {
      const res = await Model.findByPk(id, options);
      if (!res) return null;
      return res.update(payload);
    }
  },
  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      return Model.destroy({ where: { id }, ...options });
    }
  },
};
