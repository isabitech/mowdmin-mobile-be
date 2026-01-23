
let ProductModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export class ProductRepository {
  static async getModel() {
    if (!ProductModel) {
      if (isMongo) {
        ProductModel = (await import('../MongoModels/ProductMongoModel.js')).default;
      } else {
        ProductModel = (await import('../Models/ProductModel.js')).default;
      }
    }
    return ProductModel;
  }

  static async create(data) {
    const Model = await this.getModel();
    return Model.create(data);
  }
  static async findById(id, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.findById(id) : Model.findByPk(id, options);
  }
  static async findOne(where, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.findOne(where) : Model.findOne({ where, ...options });
  }
  static async findAll(options = {}) {
    const Model = await this.getModel();
      if (isMongo) {
        return Model.find({});
      } else {
        return Model.findAll(options);
      }
  }
  static async updateById(id, data, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findByIdAndUpdate(id, data, { new: true });
    } else {
      const product = await Model.findByPk(id, options);
      if (!product) return null;
      return product.update(data);
    }
  }
  static async deleteById(id, options = {}) {
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
  }
  static async findAllByUserId(userId, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.find({ userId, ...options }) : Model.findAll({ where: { userId }, ...options });
  }
}
