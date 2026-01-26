// MembershipRepository.js
let MembershipModel;
let UserModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const MembershipRepository = {
  async getModels() {
    if (!MembershipModel || (!isMongo && !UserModel)) {
      if (isMongo) {
        MembershipModel = (await import('../MongoModels/MembershipMongoModel.js')).default;
        UserModel = (await import('../MongoModels/UserMongoModel.js')).default;
      } else {
        MembershipModel = (await import('../Models/MembershipModel.js')).default;
        UserModel = (await import('../Models/UserModel.js')).default;
      }
    }
    return { MembershipModel, UserModel };
  },

  async create(dto) {
    const { MembershipModel } = await this.getModels();
    return MembershipModel.create(dto);
  },

  async findAll(query) {
    const { MembershipModel, UserModel } = await this.getModels();

    if (isMongo) {
      // Mongo implementation (basic find, can add populate if needed later)
      return MembershipModel.find(query || {});
    } else {
      return MembershipModel.findAll({
        where: query,
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
    }
  }
};

export default MembershipRepository;