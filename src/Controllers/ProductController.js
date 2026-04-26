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
    const hasPagination = page !== undefined || pageSize !== undefined;
    const pagination = hasPagination ? paginate(page || 1, pageSize) : null;

    let data;
    let meta = {};

    if (hasPagination) {
      const { items, total } = await ProductService.getAllWithCount(pagination);
      data = items;
      const pageNum = Number.parseInt(page || 1, 10);
      const limitNum = pagination?.limit;
      meta = {
        totalItems: total,
        totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
        currentPage: pageNum,
        pageSize: limitNum,
      };
    } else {
      data = await ProductService.getAll(pagination);
    }
    return sendSuccess(res, {
      message: "All Products Fetched Successfully",
      data,
      meta,
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
    const hasPagination = page !== undefined || pageSize !== undefined;
    const pagination = hasPagination ? paginate(page || 1, pageSize) : null;

    let data;
    let meta = {};

    if (hasPagination) {
      const { items, total } =
        await ProductService.getProductsByCategoryWithCount(
          req.params.categoryId,
          pagination,
        );
      data = items;
      const pageNum = Number.parseInt(page || 1, 10);
      const limitNum = pagination?.limit;
      meta = {
        totalItems: total,
        totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
        currentPage: pageNum,
        pageSize: limitNum,
      };
    } else {
      data = await ProductService.getProductsByCategory(
        req.params.categoryId,
        pagination,
      );
    }
    return sendSuccess(res, {
      message: "Products Fetched by Category Successfully",
      data,
      meta,
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
