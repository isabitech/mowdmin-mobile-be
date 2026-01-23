
let PrayerModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const PrayerRepository = {
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
    return isMongo ? Model.findById(id) : Model.findByPk(id, options);
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
