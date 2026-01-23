// TokenRepository.js
let TokenModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export class TokenRepository {
  static async getModel() {
    if (!TokenModel) {
      if (isMongo) {
        TokenModel = (await import('../MongoModels/TokenMongoModel.js')).default;
      } else {
        TokenModel = (await import('../Models/TokenModel.js')).default;
      }
    }
    return TokenModel;
  }

  static async create(dto) {
    const Model = await this.getModel();
    return Model.create(dto);
  }

  static async findAll(query) {
    const Model = await this.getModel();
    return isMongo ? Model.find(query) : Model.findAll(query);
  }

  static async findOne(query) {
    const Model = await this.getModel();
    return isMongo ? Model.findOne(query) : Model.findOne(query);
  }
}

export default TokenRepository;
