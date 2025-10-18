import Product from "../Models/ProductModel";

class ProductService {
    async create(data) {
        const res = Product.create(data);
        return res;
    }
    async update(id, data) {
        const res = this.findById(id)
        res.update(data);
        return res;

    }
    async findById(id) {
        const res = Product.findByPk(id);
        return res;
    }
    async findByIdForAUser(id, userId) {
        const res = Product.findOne({
            where: { id: id, userId: userId }
        });
        return res;
    }
    async getAll() {
        const res = await Product.findAll({
            order: [["createdAt", "ASC"]],
        });

        return res;
    }
    async delete(id) {
        const res = this.findById(id);
        res.delete();
        return true;
    }
    async getAllByUserId(userId) {
        const res = await Product.findAll({
            where: { userId: userId },
            order: [["createdAt", "ASC"]],
        });

        return res;
    }

}

export default new ProductService()