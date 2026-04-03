import mongoose from "mongoose";

let MediaBookmarkModel;
let UserModel;
let MediaModel;

const isMongo = process.env.DB_CONNECTION === "mongodb";

export const MediaBookmarkRepository = {
  isValidId(id) {
    if (!isMongo) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModels() {
    if (!MediaBookmarkModel || (!isMongo && (!UserModel || !MediaModel))) {
      if (isMongo) {
        MediaBookmarkModel = (
          await import("../MongoModels/MediaBookmarksMongoModel.js")
        ).default;
        UserModel = (await import("../MongoModels/UserMongoModel.js")).default;
        MediaModel = (await import("../MongoModels/MediaMongoModel.js"))
          .default;
      } else {
        MediaBookmarkModel = (await import("../Models/MediaBookmarksModel.js"))
          .default;
        UserModel = (await import("../Models/UserModel.js")).default;
        MediaModel = (await import("../Models/MediaModel.js")).default;
      }
    }
    return { MediaBookmarkModel, UserModel, MediaModel };
  },

  async create(payload) {
    const { MediaBookmarkModel } = await this.getModels();
    return MediaBookmarkModel.create(payload);
  },

  async findAll(options = {}) {
    const { MediaBookmarkModel, UserModel, MediaModel } =
      await this.getModels();
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    if (isMongo) {
      return MediaBookmarkModel.find({})
        .skip(offset)
        .limit(limit)
        .populate("userId", "name email")
        .populate("mediaId", "title type media_url thumbnail createdAt")
        .lean();
    } else {
      return MediaBookmarkModel.findAll({
        ...options,
        limit,
        offset,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: ["id", "name", "email"],
          },
          {
            model: MediaModel,
            as: "media",
          },
        ],
      });
    }
  },

  async findAllByUserId(userId, options = {}) {
    const { MediaBookmarkModel, MediaModel } = await this.getModels();
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    if (isMongo) {
      const { limit: _limit, offset: _offset, ...mongoOptions } = options;
      return MediaBookmarkModel.find({ userId, ...mongoOptions })
        .skip(offset)
        .limit(limit)
        .populate("mediaId", "title type media_url thumbnail createdAt")
        .lean();
    } else {
      return MediaBookmarkModel.findAll({
        where: { userId },
        ...options,
        limit,
        offset,
        include: [
          {
            model: MediaModel,
            as: "media",
          },
        ],
      });
    }
  },

  async findById(id, options = {}) {
    const { MediaBookmarkModel, UserModel, MediaModel } =
      await this.getModels();
    if (isMongo) {
      if (!this.isValidId(id)) return null;
      return MediaBookmarkModel.findById(id)
        .populate("userId", "name email")
        .populate("mediaId", "title type media_url thumbnail createdAt");
    } else {
      return MediaBookmarkModel.findByPk(id, {
        ...options,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: ["id", "name", "email"],
          },
          {
            model: MediaModel,
            as: "media",
          },
        ],
      });
    }
  },

  async updateById(id, payload, options = {}) {
    const { MediaBookmarkModel } = await this.getModels();
    if (isMongo) {
      if (!this.isValidId(id)) return null;
      return MediaBookmarkModel.findByIdAndUpdate(id, payload, {
        new: true,
      }).populate("mediaId", "title type media_url thumbnail createdAt");
    } else {
      const res = await MediaBookmarkModel.findByPk(id, options);
      if (!res) return null;
      return res.update(payload);
    }
  },

  async deleteById(id, options = {}) {
    const { MediaBookmarkModel } = await this.getModels();
    if (isMongo) {
      if (!this.isValidId(id)) return false;
      const result = await MediaBookmarkModel.findByIdAndDelete(id);
      return !!result;
    } else {
      return MediaBookmarkModel.destroy({ where: { id }, ...options });
    }
  },
};
