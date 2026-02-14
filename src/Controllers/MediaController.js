import MediaService from "../Services/MediaService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreateMedia, validateUpdateMedia } from "../middleware/Validation/MediaValidation.js";

class MediaController {
  async create(req, res, next) {
    const payload = { ...req.body };
    if (req.file) {
      payload.thumbnail = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const { error, value } = validateCreateMedia(payload);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const media = await MediaService.createMedia(value);
    return sendSuccess(res, { message: "Media Created Successfully", data: media, statusCode: 201 });
  }
  async getAll(req, res, next) {
    const filters = req.query; // Capture query parameters like ?isLive=true
    const mediaList = await MediaService.getAll(filters);
    return sendSuccess(res, { message: "All Media Fetched Successfully", data: mediaList });
  }
  async getOne(req, res, next) {
    const media = await MediaService.findById(req.params.id);
    return sendSuccess(res, { message: "Media Fetched Successfully", data: media });
  }
  async update(req, res, next) {
    const payload = { ...req.body };
    if (req.file) {
      payload.thumbnail = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const { error, value } = validateUpdateMedia(payload);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const updated = await MediaService.update(req.params.id, value);
    if (!updated) {
      return sendError(res, { message: "Media not found", statusCode: 404 });
    }
    return sendSuccess(res, { message: "Media Updated Successfully", data: updated });
  }
  async delete(req, res, next) {
    await MediaService.delete(req.params.id);
    return sendSuccess(res, { message: "Media Deleted Successfully", data: {} });
  }
}

export default new MediaController();

