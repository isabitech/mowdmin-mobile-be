
let MediaModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const MediaRepository = {
  async getModel() {
    if (!MediaModel) {
      if (isMongo) {
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
      return Model.find({});
    } else {
      return Model.findAll(options);
    }
  },
  async findById(id, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.findById(id) : Model.findByPk(id, options);
  },
  async updateById(id, payload, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findByIdAndUpdate(id, payload, { new: true });
    } else {
      return Model.update(payload, { where: { id }, returning: true, ...options });
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
