// MembershipRepository.js
let MembershipModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export class MembershipRepository {
  static async getModel() {
    if (!MembershipModel) {
      if (isMongo) {
        MembershipModel = (await import('../MongoModels/MembershipMongoModel.js')).default;
      } else {
        MembershipModel = (await import('../Models/MembershipModel.js')).default;
      }
    }
    return MembershipModel;
  }

  static async create(dto) {
    const Model = await this.getModel();
    return Model.create(dto);
  }

  static async findAll(query) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.find({});
    } else {
      return Model.findAll({ where: query });
    }
  }
}

export default MembershipRepository;