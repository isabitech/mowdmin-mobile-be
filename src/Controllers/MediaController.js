import MediaService from "../Services/MediaService.js";
import CloudinaryService from "../Services/CloudinaryService.js";
import { sendSuccess, sendError } from "../core/response.js";
import {
  validateCreateMedia,
  validateUpdateMedia,
} from "../middleware/Validation/MediaValidation.js";
import { paginate } from "../Utils/helper.js";

class MediaController {
  async create(req, res, next) {
    const payload = { ...req.body };
    if (req.file) {
      const { url } = await CloudinaryService.upload(req.file.buffer, {
        folder: "mowdmin/media",
      });
      payload.thumbnail = url;
    }

    const { error, value } = validateCreateMedia(payload);
    if (error) {
      return sendError(res, {
        message: error.details[0].message,
        statusCode: 400,
      });
    }

    const media = await MediaService.createMedia(value);
    return sendSuccess(res, {
      message: "Media Created Successfully",
      data: media,
      statusCode: 201,
    });
  }
  async getAll(req, res, next) {
    const { page, limit: pageSize, ...filters } = req.query;
    const mediaList = await MediaService.getAll(
      filters,
      paginate(page || 1, pageSize),
    );
    return sendSuccess(res, {
      message: "All Media Fetched Successfully",
      data: mediaList,
    });
  }
  async getOne(req, res, next) {
    const media = await MediaService.findById(req.params.id);
    return sendSuccess(res, {
      message: "Media Fetched Successfully",
      data: media,
    });
  }
  async update(req, res, next) {
    const payload = { ...req.body };
    if (req.file) {
      // Delete old thumbnail from Cloudinary
      const existing = await MediaService.findById(req.params.id);
      if (existing?.thumbnail) {
        await CloudinaryService.deleteIfCloudinary(existing.thumbnail);
      }
      const { url } = await CloudinaryService.upload(req.file.buffer, {
        folder: "mowdmin/media",
      });
      payload.thumbnail = url;
    }

    const { error, value } = validateUpdateMedia(payload);
    if (error) {
      return sendError(res, {
        message: error.details[0].message,
        statusCode: 400,
      });
    }

    const updated = await MediaService.update(req.params.id, value);
    if (!updated) {
      return sendError(res, { message: "Resource not found", statusCode: 404 });
    }
    return sendSuccess(res, {
      message: "Media Updated Successfully",
      data: updated,
    });
  }
  async delete(req, res, next) {
    // Delete thumbnail from Cloudinary before removing the media
    const media = await MediaService.findById(req.params.id);
    if (media?.thumbnail) {
      await CloudinaryService.deleteIfCloudinary(media.thumbnail);
    }
    await MediaService.delete(req.params.id);
    return sendSuccess(res, {
      message: "Media Deleted Successfully",
      data: {},
    });
  }
}

export default new MediaController();
