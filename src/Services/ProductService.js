import Product from "../Models/ProductModel.js";

class ProductService {
    async create(data) {
        const product = await Product.create(data);
        return product;
    }

    async update(id, data) {
        const product = await this.findById(id);
        if (!product) throw new Error("Product not found");

        await product.update(data);
        return product;
    }

    async findById(id) {
        const product = await Product.findByPk(id);
        return product;
    }

    async findByIdForAUser(id, userId) {
        const product = await Product.findOne({
            where: { id, userId },
        });
        return product;
    }

    async getAll() {
        const products = await Product.findAll({
            order: [["createdAt", "ASC"]],
        });
        return products;
    }

    async delete(id) {
        const product = await this.findById(id);
        if (!product) throw new Error("Product not found");

        await product.destroy();
        return true;
    }

    async getAllByUserId(userId) {
        const products = await Product.findAll({
            where: { userId },
            order: [["createdAt", "ASC"]],
        });
        return products;
    }
}

export default new ProductService();
