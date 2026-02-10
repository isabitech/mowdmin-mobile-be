import mongoose from 'mongoose';

let MediaModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const MediaRepository = {
  isValidId(id) {
    if (!isMongo) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModel() {
    if (!MediaModel) {
      if (isMongo) {
        // Ensure Category model is registered before population
        await import('../MongoModels/MediaCategoryMongoModel.js');
        MediaModel = (await import('../MongoModels/MediaMongoModel.js')).default;
      } else {
        MediaModel = (await import('../Models/MediaModel.js')).default;
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
    if (isMongo) {
      // Extract filter from 'where' or use the whole object if it doesn't look like Sequelize options
      const filter = options.where || (options.order || options.limit || options.offset || options.include ? {} : options);

      let query = Model.find(filter).populate('category_id').sort({ createdAt: -1 });

      if (options.limit) query = query.limit(options.limit);
      if (options.offset) query = query.skip(options.offset);

      return query;
    } else {
      const MediaCategory = (await import('../Models/MediaCategory.js')).default;
      const query = {
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: MediaCategory,
            as: 'category'
          }
        ]
      };

      if (options.where) {
        query.where = options.where;
      } else if (Object.keys(options).length > 0 && !options.limit && !options.offset && !options.order) {
        query.where = options;
      }

      if (options.limit) query.limit = options.limit;
      if (options.offset) query.offset = options.offset;
      if (options.order) query.order = options.order;

      return Model.findAll(query);
    }
  },
  async findById(id, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findById(id).populate('category_id');
    } else {
      const MediaCategory = (await import('../Models/MediaCategory.js')).default;
      return Model.findByPk(id, {
        ...options,
        include: [
          {
            model: MediaCategory,
            as: 'category'
          }
        ]
      });
    }
  },
  async updateById(id, payload, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      if (!this.isValidId(id)) return null;
      return Model.findByIdAndUpdate(id, payload, { new: true }).populate('category_id');
    } else {
      const res = await Model.findByPk(id, options);
      if (!res) return null;
      return res.update(payload);
    }
  },
  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      return Model.destroy({ where: { id }, ...options });
    }
  },
};
