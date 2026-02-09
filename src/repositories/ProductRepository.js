let ProductModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const ProductRepository = {
  async getModel() {
    if (!ProductModel) {
      if (isMongo) {
        ProductModel = (await import('../MongoModels/ProductMongoModel.js')).default;
      } else {
        ProductModel = (await import('../Models/ProductModel.js')).default;
      }
    }
    return ProductModel;
  },

  async create(data) {
    const Model = await this.getModel();
    return Model.create(data);
  },

  async findById(id, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.findById(id) : Model.findByPk(id, options);
  },

  async findOne(where, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.findOne(where) : Model.findOne({ where, ...options });
  },

  async findAll(options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      // If options.where exists, use it, otherwise use the options object itself as filter if it doesn't look like Sequelize options
      const filter = options.where || (options.order || options.limit || options.offset || options.include ? {} : options);
      return Model.find(filter);
    } else {
      return Model.findAll(options);
    }
  },

  async updateById(id, data, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findByIdAndUpdate(id, data, { new: true });
    } else {
      const product = await Model.findByPk(id, options);
      if (!product) return null;
      return product.update(data);
    }
  },

  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      const product = await Model.findByPk(id, options);
      if (!product) return null;
      await product.destroy();
      return true;
    }
  },

  async findAllByUserId(userId, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.find({ userId, ...options }) : Model.findAll({ where: { userId }, ...options });
  }
};

export default ProductRepository;
