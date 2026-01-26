// TokenRepository.js
let TokenModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const TokenRepository = {
  async getModel() {
    if (!TokenModel) {
      if (isMongo) {
        TokenModel = (await import('../MongoModels/TokenMongoModel.js')).default;
      } else {
        TokenModel = (await import('../Models/TokenModel.js')).default;
      }
    }
    return TokenModel;
  },

  async create(dto) {
    const Model = await this.getModel();
    return Model.create(dto);
  },

  async findAll(query) {
    const Model = await this.getModel();
    return isMongo ? Model.find(query) : Model.findAll({ where: query });
  },

  async findOne(query) {
    const Model = await this.getModel();
    return isMongo ? Model.findOne(query) : Model.findOne({ where: query });
  }
};

export default TokenRepository;
