// TokenRepository.js
let TokenModel;
const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";

export const TokenRepository = {
  async getModel() {
    if (!TokenModel) {
      if (getIsMongo()) {
        TokenModel = (await import("../MongoModels/TokenMongoModel.js"))
          .default;
      } else {
        TokenModel = (await import("../Models/TokenModel.js")).default;
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
    return getIsMongo() ? Model.find(query) : Model.findAll({ where: query });
  },

  async findOne(query) {
    const Model = await this.getModel();
    return getIsMongo()
      ? Model.findOne(query)
      : Model.findOne({ where: query });
  },
};

export default TokenRepository;
