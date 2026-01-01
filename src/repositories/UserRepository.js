
let UserModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const UserRepository = {
  async getModel() {
    if (!UserModel) {
      if (isMongo) {
        UserModel = (await import('../MongoModels/UserMongoModel.js')).default;
      } else {
        UserModel = (await import('../Models/UserModel.js')).default;
      }
    }
    return UserModel;
  },

  async findByEmail(email) {
    const Model = await this.getModel();
    return isMongo ? Model.findOne({ email }) : Model.findOne({ where: { email } });
  },
  async findById(id) {
    const Model = await this.getModel();
    return isMongo ? Model.findById(id) : Model.findByPk(id);
  },
  async create(payload) {
    const Model = await this.getModel();
    return Model.create(payload);
  },
};
