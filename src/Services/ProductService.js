import { ProductRepository } from "../repositories/ProductRepository.js";

class ProductService {
    async create(data) {
        return ProductRepository.create(data);
    }

    async update(id, data) {
        const updated = await ProductRepository.updateById(id, data);
        if (!updated) throw new Error("Product not found");
        return updated;
    }

    async findById(id) {
        return ProductRepository.findById(id);
    }

    async findByIdForAUser(id, userId) {
        return ProductRepository.findOne({ id, userId });
    }

    async getAll() {
        return ProductRepository.findAll({
            order: [["createdAt", "ASC"]],
        });
    }

    async delete(id) {
        const deleted = await ProductRepository.deleteById(id);
        if (!deleted) throw new Error("Product not found");
        return deleted;
    }

    async getAllByUserId(userId) {
        return ProductRepository.findAllByUserId(userId, {
            order: [["createdAt", "ASC"]],
        });
    }
}

export default new ProductService();
