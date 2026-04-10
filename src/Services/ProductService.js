import { ProductRepository } from "../repositories/ProductRepository.js";

class ProductService {
  async createProduct(data) {
    return ProductRepository.create(data);
  }

  async updateProduct(id, data) {
    const updated = await ProductRepository.updateById(id, data);
    if (!updated) throw new Error("Resource not found");
    return updated;
  }

  async getProductById(id) {
    return ProductRepository.findById(id);
  }

  async getProductsByCategory(categoryId, pagination = {}) {
    return ProductRepository.findAll({
      where: { category: categoryId },
      ...pagination,
    });
  }

  async getAll(pagination = {}) {
    return ProductRepository.findAll({
      order: [["createdAt", "ASC"]],
      ...pagination,
    });
  }

  async deleteProduct(id) {
    const deleted = await ProductRepository.deleteById(id);
    if (!deleted) throw new Error("Resource not found");
    return deleted;
  }

  async getAllByUserId(userId) {
    return ProductRepository.findAllByUserId(userId, {
      order: [["createdAt", "ASC"]],
    });
  }
}

export default new ProductService();
