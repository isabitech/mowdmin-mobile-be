// MembershipRepository.js
let MembershipModel;
let UserModel;

const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";

export const MembershipRepository = {
  async getModels() {
    if (!MembershipModel || (!getIsMongo() && !UserModel)) {
      if (getIsMongo()) {
        MembershipModel = (
          await import("../MongoModels/MembershipMongoModel.js")
        ).default;
        UserModel = (await import("../MongoModels/UserMongoModel.js")).default;
      } else {
        MembershipModel = (await import("../Models/MembershipModel.js"))
          .default;
        UserModel = (await import("../Models/UserModel.js")).default;
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
    const parsedLimit = Number.parseInt(query?.limit, 10);
    const parsedOffset = Number.parseInt(query?.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    const { limit: _limit, offset: _offset, ...where } = query || {};

    if (getIsMongo()) {
      // Mongo implementation (basic find, can add populate if needed later)
      return MembershipModel.find(where).skip(offset).limit(limit).lean();
    } else {
      return MembershipModel.findAll({
        where,
        limit,
        offset,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      });
    }
  },
};

export default MembershipRepository;
