import MediaService from "../Services/MediaService.js";
import { success } from "../Utils/helper.js";

class MediaController {
  async create(req, res, next) {
    const data = { ...req.body };
    const media = await MediaService.create(data);

    return success(res, "Media Created Successfully", media);
  }

  async getAll(req, res, next) {
    const mediaList = await MediaService.getAll();
    return success(res, "All Media Fetched Successfully", mediaList);
  }

  async getOne(req, res, next) {
    const media = await MediaService.findById(req.params.id);
    return success(res, "Media Fetched Successfully", media);
  }

  async update(req, res, next) {
    const updated = await MediaService.update(req.params.id, req.body);
    return success(res, "Media Updated Successfully", updated);
  }

  async delete(req, res, next) {
    await MediaService.delete(req.params.id);
    return success(res, "Media Deleted Successfully");
  }
}

export default new MediaController();
