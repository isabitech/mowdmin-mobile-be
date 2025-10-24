import ProductService from "../Services/ProductService.js";
import { success } from "../Utils/helper.js";

class ProductController {
    async create(req, res) {
        const product = await ProductService.createProduct(req.body);
        return success(res, "Product Created Successfully", product);
    }

    async getAll(req, res) {
        const products = await ProductService.getAllProducts();
        return success(res, "All Products Fetched Successfully", products);
    }

    async getOne(req, res) {
        const product = await ProductService.getProductById(req.params.id);
        return success(res, "Product Fetched Successfully", product);
    }

    async getByCategory(req, res) {
        const products = await ProductService.getProductsByCategory(req.params.categoryId);
        return success(res, "Products Fetched by Category Successfully", products);
    }

    async update(req, res) {
        const product = await ProductService.updateProduct(req.params.id, req.body);
        return success(res, "Product Updated Successfully", product);
    }

    async delete(req, res) {
        await ProductService.deleteProduct(req.params.id);
        return success(res, "Product Deleted Successfully");
    }
}

export default new ProductController();
