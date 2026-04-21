import mongoose from "mongoose";

let PrayerRequestModel;
let UserModel;

const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";
const DEFAULT_PRAYER_REQUEST_PAGE_SIZE = 20;
const MAX_PRAYER_REQUEST_PAGE_SIZE = 100;

export const PrayerRequestRepository = {
  isValidId(id) {
    if (!getIsMongo()) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModels() {
    if (!PrayerRequestModel || (!getIsMongo() && !UserModel)) {
      if (getIsMongo()) {
        PrayerRequestModel = (
          await import("../MongoModels/PrayerRequestMongoModel.js")
        ).default;
        UserModel = (await import("../MongoModels/UserMongoModel.js")).default;
      } else {
        PrayerRequestModel = (await import("../Models/PrayerRequestModel.js"))
          .default;
        UserModel = (await import("../Models/UserModel.js")).default;
      }
    }
    return { PrayerRequestModel, UserModel };
  },

  async create(data) {
    const { PrayerRequestModel } = await this.getModels();
    return PrayerRequestModel.create(data);
  },

  async findById(id, options = {}) {
    const { PrayerRequestModel, UserModel } = await this.getModels();
    if (getIsMongo()) {
      if (!this.isValidId(id)) return null;
      return PrayerRequestModel.findById(id).populate("userId", "name email");
    } else {
      return PrayerRequestModel.findByPk(id, {
        ...options,
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

  async findOne(where, options = {}) {
    const { PrayerRequestModel, UserModel } = await this.getModels();
    if (getIsMongo()) {
      return PrayerRequestModel.findOne(where).populate("userId", "name email");
    } else {
      return PrayerRequestModel.findOne({
        where,
        ...options,
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

  async findAll(options = {}) {
    const { PrayerRequestModel, UserModel } = await this.getModels();
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_PRAYER_REQUEST_PAGE_SIZE)
        : DEFAULT_PRAYER_REQUEST_PAGE_SIZE;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    if (getIsMongo()) {
      const {
        where,
        order,
        include,
        limit: _limit,
        offset: _offset,
        ...rawFilter
      } = options;
      const filter = where || rawFilter;
      let query = PrayerRequestModel.find(filter).populate(
        "userId",
        "name email",
      );

      if (options.order) {
        const sort = {};
        options.order.forEach(([field, direction]) => {
          sort[field] = direction.toUpperCase() === "DESC" ? -1 : 1;
        });
        query = query.sort(sort);
      }
      query = query.limit(limit).skip(offset);

      return query;
    } else {
      return PrayerRequestModel.findAll({
        ...options,
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

  async updateById(id, data, options = {}) {
    const { PrayerRequestModel } = await this.getModels();
    if (getIsMongo()) {
      return PrayerRequestModel.findByIdAndUpdate(id, data, { new: true });
    } else {
      const prayerRequest = await PrayerRequestModel.findByPk(id, options);
      if (!prayerRequest) return null;
      return prayerRequest.update(data);
    }
  },

  async deleteById(id, options = {}) {
    const { PrayerRequestModel } = await this.getModels();
    if (getIsMongo()) {
      const result = await PrayerRequestModel.findByIdAndDelete(id);
      return !!result;
    } else {
      const prayerRequest = await PrayerRequestModel.findByPk(id, options);
      if (!prayerRequest) return null;
      await prayerRequest.destroy();
      return true;
    }
  },

  async findAllByUserId(userId, options = {}) {
    const { PrayerRequestModel } = await this.getModels();
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_PRAYER_REQUEST_PAGE_SIZE)
        : DEFAULT_PRAYER_REQUEST_PAGE_SIZE;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    if (getIsMongo()) {
      let query = PrayerRequestModel.find({ userId });

      if (options.order) {
        const sort = {};
        options.order.forEach(([field, direction]) => {
          sort[field] = direction.toUpperCase() === "DESC" ? -1 : 1;
        });
        query = query.sort(sort);
      }
      query = query.limit(limit).skip(offset);

      return query;
    } else {
      return PrayerRequestModel.findAll({
        where: { userId },
        ...options,
        limit,
        offset,
      });
    }
  },
};
