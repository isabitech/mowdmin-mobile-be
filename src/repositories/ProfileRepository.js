
let ProfileModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

const ProfileRepository = {
  async getModel() {
    if (!ProfileModel) {
      if (isMongo) {
        ProfileModel = (await import('../MongoModels/ProfileMongoModel.js')).default;
      } else {
        ProfileModel = (await import('../Models/ProfileModel.js')).default;
      }
    }
    return ProfileModel;
  },

  async findByUserId(userId) {
    const Model = await this.getModel();
    return isMongo ? Model.findOne({ userId }) : Model.findOne({ where: { userId } });
  },
  async findByIdWithUser(id, UserModel) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findById(id).populate('userId', 'id name email');
    } else {
      return Model.findByPk(id, {
        include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }],
      });
    }
  },
  async update(profile, payload) {
    if (isMongo) {
      Object.assign(profile, payload);
      return profile.save();
    } else {
      return profile.update(payload);
    }
  },
  async create(payload) {
    const Model = await this.getModel();
    return Model.create(payload);
  },
  async updateByUserId(userId, payload) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findOneAndUpdate({ userId }, payload, { new: true });
    } else {
      return Model.update(payload, { where: { userId } });
    }
  },
};

export default ProfileRepository;
