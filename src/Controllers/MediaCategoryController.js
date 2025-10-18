import MediaCategoryService from "../Services/MediaCategoryService.js";
import { success } from "../Utils/helper.js";

class MediaCategoryController {
  async create(req, res, next) {
    const data = { ...req.body };
    const category = await MediaCategoryService.create(data);

    return success(res, "Media Category Created Successfully", category);
  }

  async getAll(req, res, next) {
    const categories = await MediaCategoryService.getAll();
    return success(res, "All Media Categories Fetched Successfully", categories);
  }

  async getOne(req, res, next) {
    const category = await MediaCategoryService.findById(req.params.id);
    return success(res, "Media Category Fetched Successfully", category);
  }

  async update(req, res, next) {
    const updated = await MediaCategoryService.update(req.params.id, req.body);
    return success(res, "Media Category Updated Successfully", updated);
  }

  async delete(req, res, next) {
    await MediaCategoryService.delete(req.params.id);
    return success(res, "Media Category Deleted Successfully");
  }
}

export default new MediaCategoryController();
