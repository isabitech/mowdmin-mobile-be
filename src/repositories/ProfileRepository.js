
let ProfileModel;
let UserModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

const ProfileRepository = {
  async getModels() {
    if (!ProfileModel || (!isMongo && !UserModel)) {
      if (isMongo) {
        ProfileModel = (await import('../MongoModels/ProfileMongoModel.js')).default;
        UserModel = (await import('../MongoModels/UserMongoModel.js')).default;
      } else {
        ProfileModel = (await import('../Models/ProfileModel.js')).default;
        UserModel = (await import('../Models/UserModel.js')).default;
      }
    }
    return { ProfileModel, UserModel };
  },

  async findByUserId(userId) {
    const { ProfileModel } = await this.getModels();
    return isMongo ? ProfileModel.findOne({ userId }) : ProfileModel.findOne({ where: { userId } });
  },

  async findByIdWithUser(id) {
    const { ProfileModel, UserModel } = await this.getModels();
    if (isMongo) {
      return ProfileModel.findById(id).populate('userId', 'id name email');
    } else {
      return ProfileModel.findByPk(id, {
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
    const { ProfileModel } = await this.getModels();
    return ProfileModel.create(payload);
  },

  async updateByUserId(userId, payload) {
    const { ProfileModel } = await this.getModels();
    if (isMongo) {
      return ProfileModel.findOneAndUpdate({ userId }, payload, { new: true });
    } else {
      return ProfileModel.update(payload, { where: { userId } });
    }
  },
  async findByUserIdWithUser(userId) {
    const { ProfileModel, UserModel } = await this.getModels();
    if (isMongo) {
      return ProfileModel.findOne({ userId }).populate('userId', 'id name email emailVerified');
    } else {
      return ProfileModel.findOne({
        where: { userId },
        include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email', 'emailVerified'] }],
      });
    }
  },

  async deleteByUserId(userId) {
    const { ProfileModel } = await this.getModels();
    if (isMongo) {
      return ProfileModel.findOneAndDelete({ userId });
    } else {
      return ProfileModel.destroy({ where: { userId } });
    }
  },
};

export default ProfileRepository;
