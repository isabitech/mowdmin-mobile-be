import mongoose from "mongoose";

let MediaModel;
const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";
const DEFAULT_MEDIA_PAGE_SIZE = 20;
const MAX_MEDIA_PAGE_SIZE = 100;

export const MediaRepository = {
  isValidId(id) {
    if (!getIsMongo()) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModel() {
    if (!MediaModel) {
      if (getIsMongo()) {
        // Ensure Category model is registered before population
        await import("../MongoModels/MediaCategoryMongoModel.js");
        MediaModel = (await import("../MongoModels/MediaMongoModel.js"))
          .default;
      } else {
        MediaModel = (await import("../Models/MediaModel.js")).default;
      }
    }
    return MediaModel;
  },

  async create(payload) {
    const Model = await this.getModel();
    return Model.create(payload);
  },
  async findAll(options = {}) {
    const Model = await this.getModel();
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_MEDIA_PAGE_SIZE)
        : DEFAULT_MEDIA_PAGE_SIZE;
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

      let query = Model.find(filter)
        .populate("category_id", "name")
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      return query.lean();
    } else {
      const MediaCategory = (await import("../Models/MediaCategory.js"))
        .default;
      const query = {
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: MediaCategory,
            as: "category",
          },
        ],
      };

      if (options.where) {
        query.where = options.where;
      } else if (
        Object.keys(options).length > 0 &&
        !options.limit &&
        !options.offset &&
        !options.order
      ) {
        query.where = options;
      }

      query.limit = limit;
      query.offset = offset;
      if (options.order) query.order = options.order;

      return Model.findAll(query);
    }
  },

  async findAllWithCount(options = {}) {
    const Model = await this.getModel();
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_MEDIA_PAGE_SIZE)
        : DEFAULT_MEDIA_PAGE_SIZE;
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

      let query = Model.find(filter)
        .populate("category_id", "name")
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      const [items, total] = await Promise.all([
        query.lean(),
        Model.countDocuments(filter),
      ]);

      return { items, total };
    } else {
      const MediaCategory = (await import("../Models/MediaCategory.js"))
        .default;
      const query = {
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: MediaCategory,
            as: "category",
          },
        ],
        limit,
        offset,
      };

      if (options.where) {
        query.where = options.where;
      } else if (
        Object.keys(options).length > 0 &&
        !options.limit &&
        !options.offset &&
        !options.order
      ) {
        query.where = options;
      }

      if (options.order) query.order = options.order;

      const { rows, count } = await Model.findAndCountAll({
        ...query,
        distinct: true,
      });

      return { items: rows, total: count };
    }
  },
  async findById(id, options = {}) {
    const Model = await this.getModel();
    if (getIsMongo()) {
      return Model.findById(id).populate("category_id", "name");
    } else {
      const MediaCategory = (await import("../Models/MediaCategory.js"))
        .default;
      return Model.findByPk(id, {
        ...options,
        include: [
          {
            model: MediaCategory,
            as: "category",
          },
        ],
      });
    }
  },
  async updateById(id, payload, options = {}) {
    const Model = await this.getModel();
    if (getIsMongo()) {
      if (!this.isValidId(id)) return null;
      return Model.findByIdAndUpdate(id, payload, { new: true }).populate(
        "category_id",
        "name",
      );
    } else {
      const res = await Model.findByPk(id, options);
      if (!res) return null;
      return res.update(payload);
    }
  },
  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (getIsMongo()) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      return Model.destroy({ where: { id }, ...options });
    }
  },
};
