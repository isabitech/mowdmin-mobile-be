import MediaService from "../Services/MediaService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreateMedia, validateUpdateMedia } from "../validators/mediaValidators.js";

class MediaController {
  async create(req, res, next) {
    const { error, value } = validateCreateMedia(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const media = await MediaService.createMedia(value);
    return sendSuccess(res, { message: "Media Created Successfully", data: media, statusCode: 201 });
  }
  async getAll(req, res, next) {
    const mediaList = await MediaService.getAll();
    return sendSuccess(res, { message: "All Media Fetched Successfully", data: mediaList });
  }
  async getOne(req, res, next) {
    const media = await MediaService.findById(req.params.id);
    return sendSuccess(res, { message: "Media Fetched Successfully", data: media });
  }
  async update(req, res, next) {
    const { error, value } = validateUpdateMedia(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const updated = await MediaService.update(req.params.id, value);
    return sendSuccess(res, { message: "Media Updated Successfully", data: updated });
  }
  async delete(req, res, next) {
    await MediaService.delete(req.params.id);
    return sendSuccess(res, { message: "Media Deleted Successfully", data: {} });
  }
}

export default new MediaController();
