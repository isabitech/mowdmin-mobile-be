
let PrayerRequestModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const PrayerRequestRepository = {
  async getModel() {
    if (!PrayerRequestModel) {
      if (isMongo) {
        PrayerRequestModel = (await import('../MongoModels/PrayerRequestMongoModel.js')).default;
      } else {
        PrayerRequestModel = (await import('../Models/PrayerRequestModel.js')).default;
      }
    }
    return PrayerRequestModel;
  },

  async create(data) {
    const Model = await this.getModel();
    return Model.create(data);
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
  async updateById(id, data, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findByIdAndUpdate(id, data, { new: true });
    } else {
      const prayerRequest = await Model.findByPk(id, options);
      if (!prayerRequest) return null;
      return prayerRequest.update(data);
    }
  },
  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      const prayerRequest = await Model.findByPk(id, options);
      if (!prayerRequest) return null;
      await prayerRequest.destroy();
      return true;
    }
  },
  async findAllByUserId(userId, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.find({ userId, ...options }) : Model.findAll({ where: { userId }, ...options });
  },
};
