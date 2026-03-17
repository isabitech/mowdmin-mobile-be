import ProductService from "../Services/ProductService.js";
import { sendSuccess, sendError } from "../core/response.js";
import {
  validateCreateProduct,
  validateUpdateProduct,
} from "../middleware/Validation/ProductValidation.js";
import { paginate } from "../Utils/helper.js";

class ProductController {
  async create(req, res) {
    const { error, value } = validateCreateProduct(req.body);
    if (error) {
      return sendError(res, {
        message: error.details[0].message,
        statusCode: 400,
      });
    }

    const product = await ProductService.createProduct(value);
    return sendSuccess(res, {
      message: "Product Created Successfully",
      data: product,
      statusCode: 201,
    });
  }
  async getAll(req, res) {
    const { page, limit: pageSize } = req.query;
    const products = await ProductService.getAll(paginate(page || 1, pageSize));
    return sendSuccess(res, {
      message: "All Products Fetched Successfully",
      data: products,
    });
  }
  async getOne(req, res) {
    const product = await ProductService.getProductById(req.params.id);
    return sendSuccess(res, {
      message: "Product Fetched Successfully",
      data: product,
    });
  }
  async getByCategory(req, res) {
    const { page, limit: pageSize } = req.query;
    const products = await ProductService.getProductsByCategory(
      req.params.categoryId,
      paginate(page || 1, pageSize),
    );
    return sendSuccess(res, {
      message: "Products Fetched by Category Successfully",
      data: products,
    });
  }
  async update(req, res) {
    const { error, value } = validateUpdateProduct(req.body);
    if (error) {
      return sendError(res, {
        message: error.details[0].message,
        statusCode: 400,
      });
    }

    const product = await ProductService.updateProduct(req.params.id, value);
    return sendSuccess(res, {
      message: "Product Updated Successfully",
      data: product,
    });
  }
  async delete(req, res) {
    await ProductService.deleteProduct(req.params.id);
    return sendSuccess(res, {
      message: "Product Deleted Successfully",
      data: {},
    });
  }
}

export default new ProductController();
