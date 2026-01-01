
let MediaCategoryModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const MediaCategoryRepository = {
  async getModel() {
    if (!MediaCategoryModel) {
      if (isMongo) {
        MediaCategoryModel = (await import('../MongoModels/MediaCategoryMongoModel.js')).default;
      } else {
        MediaCategoryModel = (await import('../Models/MediaCategory.js')).default;
      }
    }
    return MediaCategoryModel;
  },

  async create(payload) {
    const Model = await this.getModel();
    return Model.create(payload);
  },
  async findAll() {
    const Model = await this.getModel();
     if (isMongo) {
       return Model.find({});
     } else {
       return Model.findAll(options);
     }
  },
  async findById(id) {
    const Model = await this.getModel();
    return isMongo ? Model.findById(id) : Model.findByPk(id);
  },
  async updateById(id, payload) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findByIdAndUpdate(id, payload, { new: true });
    } else {
      return Model.update(payload, { where: { id }, returning: true });
    }
  },
  async deleteById(id) {
    const Model = await this.getModel();
    if (isMongo) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      return Model.destroy({ where: { id } });
    }
  },
};
