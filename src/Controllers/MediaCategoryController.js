import MediaCategoryService from "../Services/MediaCategoryService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreateMediaCategory, validateUpdateMediaCategory } from "../validators/mediaCategoryValidators.js";

class MediaCategoryController {
  async create(req, res, next) {
    const { error, value } = validateCreateMediaCategory(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const category = await MediaCategoryService.createMediaCategory(value);
    return sendSuccess(res, { message: "Media Category Created Successfully", data: category, statusCode: 201 });
  }

  async getAll(req, res, next) {
    const categories = await MediaCategoryService.getAllMediaCategories();
    return sendSuccess(res, { message: "All Media Categories Fetched Successfully", data: categories });
  }
  async getOne(req, res, next) {
    const category = await MediaCategoryService.findById(req.params.id);
    return sendSuccess(res, { message: "Media Category Fetched Successfully", data: category });
  }
  async update(req, res, next) {
    const { error, value } = validateUpdateMediaCategory(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const updated = await MediaCategoryService.updateMediaCategory(req.params.id, value);
    return sendSuccess(res, { message: "Media Category Updated Successfully", data: updated });
  }
  async delete(req, res, next) {
    await MediaCategoryService.deleteMediaCategory(req.params.id);
    return sendSuccess(res, { message: "Media Category Deleted Successfully", data: {} });
  }
}

export default new MediaCategoryController();
