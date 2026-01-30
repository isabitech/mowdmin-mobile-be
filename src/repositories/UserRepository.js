let UserModel;
let ProfileModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const UserRepository = {
  async getModels() {
    if (!UserModel || (!isMongo && !ProfileModel)) {
      if (isMongo) {
        const userImport = await import('../MongoModels/UserMongoModel.js');
        const profileImport = await import('../MongoModels/ProfileMongoModel.js');

        UserModel = userImport.default;
        ProfileModel = profileImport.default;
      } else {
        const userImport = await import('../Models/UserModel.js');
        const profileImport = await import('../Models/ProfileModel.js');

        UserModel = userImport.default;
        ProfileModel = profileImport.default;
      }
    }

    return { UserModel, ProfileModel };
  },

  async findByEmail(email) {
    const { UserModel, ProfileModel } = await this.getModels();

    if (isMongo) {
      return UserModel.findOne({ email });
    }

    return UserModel.findOne({
      where: { email },
      include: [
        {
          model: ProfileModel,
          as: 'profile'
        }
      ]
    });
  },

  async findById(id) {
    const { UserModel } = await this.getModels();

    return isMongo
      ? UserModel.findById(id)
      : UserModel.findByPk(id);
  },

  async create(payload) {
    const { UserModel } = await this.getModels();
    return UserModel.create(payload);
  },

  async findAll(filters = {}) {
    const { UserModel } = await this.getModels();
    if (isMongo) {
      return UserModel.find(filters);
    }
    return UserModel.findAll({ where: filters });
  },

  async update(id, data) {
    const { UserModel } = await this.getModels();
    if (isMongo) {
      return UserModel.findByIdAndUpdate(id, data, { new: true });
    }
    const user = await UserModel.findByPk(id);
    if (user) {
      return user.update(data);
    }
    return null;
  },

  async findOne(where) {
    const { UserModel } = await this.getModels();
    return isMongo
      ? UserModel.findOne(where)
      : UserModel.findOne({ where });
  }
};
