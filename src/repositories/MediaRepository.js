
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
      // In Mongo, options are the filter query directly
      return Model.find(options).sort({ createdAt: -1 });
    } else {
      // In SQL, options might be filters. We need to wrap them in { where: ... } if they are simple key-values
      // But findAll usually takes { where: {}, order: [] }.
      // Let's assume options maps to 'where' if it contains simple keys.
      // Or we standardize: Service passes { where: filters }?
      // For simplicity here, let's treat options as the WHERE clause essentialy, or merge standard options.
      // But wait, the Service passed `filters` directly.
      // Let's restructure:
      const query = { order: [["createdAt", "DESC"]] };
      if (Object.keys(options).length > 0) {
        query.where = options;
      }
      return Model.findAll(query);
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
