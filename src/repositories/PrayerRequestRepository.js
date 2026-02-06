import mongoose from 'mongoose';

let PrayerRequestModel;
let UserModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const PrayerRequestRepository = {
  isValidId(id) {
    if (!isMongo) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModels() {
    if (!PrayerRequestModel || (!isMongo && !UserModel)) {
      if (isMongo) {
        PrayerRequestModel = (await import('../MongoModels/PrayerRequestMongoModel.js')).default;
        UserModel = (await import('../MongoModels/UserMongoModel.js')).default;
      } else {
        PrayerRequestModel = (await import('../Models/PrayerRequestModel.js')).default;
        UserModel = (await import('../Models/UserModel.js')).default;
      }
    }
    return { PrayerRequestModel, UserModel };
  },

  async create(data) {
    const { PrayerRequestModel } = await this.getModels();
    return PrayerRequestModel.create(data);
  },

  async findById(id, options = {}) {
    const { PrayerRequestModel, UserModel } = await this.getModels();
    if (isMongo) {
      if (!this.isValidId(id)) return null;
      return PrayerRequestModel.findById(id).populate('userId', 'name email');
    } else {
      return PrayerRequestModel.findByPk(id, {
        ...options,
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
    }
  },

  async findOne(where, options = {}) {
    const { PrayerRequestModel, UserModel } = await this.getModels();
    if (isMongo) {
      return PrayerRequestModel.findOne(where).populate('userId', 'name email');
    } else {
      return PrayerRequestModel.findOne({
        where,
        ...options,
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
    }
  },

  async findAll(options = {}) {
    const { PrayerRequestModel, UserModel } = await this.getModels();
    if (isMongo) {
      return PrayerRequestModel.find({}).populate('userId', 'name email');
    } else {
      return PrayerRequestModel.findAll({
        ...options,
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
    }
  },

  async updateById(id, data, options = {}) {
    const { PrayerRequestModel } = await this.getModels();
    if (isMongo) {
      return PrayerRequestModel.findByIdAndUpdate(id, data, { new: true });
    } else {
      const prayerRequest = await PrayerRequestModel.findByPk(id, options);
      if (!prayerRequest) return null;
      return prayerRequest.update(data);
    }
  },

  async deleteById(id, options = {}) {
    const { PrayerRequestModel } = await this.getModels();
    if (isMongo) {
      const result = await PrayerRequestModel.findByIdAndDelete(id);
      return !!result;
    } else {
      const prayerRequest = await PrayerRequestModel.findByPk(id, options);
      if (!prayerRequest) return null;
      await prayerRequest.destroy();
      return true;
    }
  },

  async findAllByUserId(userId, options = {}) {
    const { PrayerRequestModel } = await this.getModels();
    return isMongo ? PrayerRequestModel.find({ userId, ...options }) : PrayerRequestModel.findAll({ where: { userId }, ...options });
  },
};
