import PrayerService from "../Services/PrayerService.js";
import { sendSuccess, sendError } from "../core/response.js";
import mongoose from "mongoose";
import { paginate } from "../Utils/helper.js";

class PrayerController {
  // Helper to validate ObjectId
  isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  };

  // Admin: Attach a user prayer request to the prayer wall
  attachRequest = async (req, res) => {
    const { requestId } = req.params;
    if (!this.isValidId(requestId)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }
    const prayer = await PrayerService.createFromRequest(
      requestId,
      req.user.id,
    );
    if (!prayer)
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    return sendSuccess(res, {
      message: "Prayer published from request",
      data: prayer,
    });
  };

  create = async (req, res) => {
    const data = { ...req.body, userId: req.user.id };
    const prayer = await PrayerService.createPrayer(data);
    return sendSuccess(res, {
      message: "Prayer Created Successfully",
      data: prayer,
      statusCode: 201,
    });
  };

  getAll = async (req, res) => {
    const { page, limit: pageSize } = req.query;
    const pagination = paginate(page || 1, pageSize);
    if (req.user.isAdmin) {
      const prayers = await PrayerService.getAll(undefined, pagination);
      return sendSuccess(res, {
        message: "All Prayers Fetched Successfully",
        data: prayers,
      });
    }
    const prayers = await PrayerService.getAll(req.user.id, pagination);
    return sendSuccess(res, {
      message: "All Prayers Fetched Successfully",
      data: prayers,
    });
  };

  getAllByUser = async (req, res) => {
    const { page, limit: pageSize } = req.query;
    const pagination = paginate(page || 1, pageSize);
    const prayers = await PrayerService.getAllByUserId(req.user.id, pagination);
    return sendSuccess(res, {
      message: "My General Prayers Fetched Successfully",
      data: prayers,
    });
  };

  getSingle = async (req, res) => {
    const { id } = req.params;
    if (!this.isValidId(id)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }
    const prayer = await PrayerService.findById(id);
    if (!prayer)
      return sendError(res, { message: "Resource not found", statusCode: 404 });

    return sendSuccess(res, {
      message: "Prayer Fetched Successfully",
      data: prayer,
    });
  };

  update = async (req, res) => {
    const { id } = req.params;
    if (!this.isValidId(id)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }
    const updated = await PrayerService.update(id, req.body);
    if (!updated)
      return sendError(res, { message: "Resource not found", statusCode: 404 });

    return sendSuccess(res, {
      message: "Prayer Updated Successfully",
      data: updated,
    });
  };

  delete = async (req, res) => {
    const { id } = req.params;
    if (!this.isValidId(id)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }
    const prayer = await PrayerService.findById(id); // Admin can delete any prayer
    if (!prayer)
      return sendError(res, { message: "Resource not found", statusCode: 404 });

    await PrayerService.delete(id);
    return sendSuccess(res, {
      message: "Prayer Deleted Successfully",
      data: {},
    });
  };
}

export default new PrayerController();
