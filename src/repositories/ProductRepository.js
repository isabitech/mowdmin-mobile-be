import Product from "../Models/ProductModel.js";

export const ProductRepository = {
  create: (data) => Product.create(data),
  findById: (id, options = {}) => Product.findByPk(id, options),
  findOne: (where, options = {}) => Product.findOne({ where, ...options }),
  findAll: (options = {}) => Product.findAll(options),
  updateById: async (id, data, options = {}) => {
    const product = await Product.findByPk(id, options);
    if (!product) return null;
    return product.update(data);
  },
  deleteById: async (id, options = {}) => {
    const product = await Product.findByPk(id, options);
    if (!product) return null;
    await product.destroy();
    return true;
  },
  findAllByUserId: (userId, options = {}) =>
    Product.findAll({ where: { userId }, ...options }),
};
