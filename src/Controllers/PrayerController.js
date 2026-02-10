import PrayerService from "../Services/PrayerService.js";
import { sendSuccess, sendError } from "../core/response.js";
import mongoose from "mongoose";

class PrayerController {
  // Helper to validate ObjectId
  isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  // Admin: Attach a user prayer request to the prayer wall
  async attachRequest(req, res) {
    const { requestId } = req.params;
    if (!this.isValidId(requestId)) {
      return sendError(res, { message: "Invalid Prayer Request ID format", statusCode: 400 });
    }
    const prayer = await PrayerService.createFromRequest(requestId, req.user.id);
    if (!prayer) return sendError(res, { message: "Prayer Request Not Found", statusCode: 404 });
    return sendSuccess(res, { message: "Prayer published from request", data: prayer });
  }

  async create(req, res) {
    const data = { ...req.body, userId: req.user.id };
    const prayer = await PrayerService.createPrayer(data);
    return sendSuccess(res, { message: "Prayer Created Successfully", data: prayer, statusCode: 201 });
  }

  async getAll(req, res) {
    if (req.user.isAdmin) {
      const prayers = await PrayerService.getAll();
      return sendSuccess(res, { message: "All Prayers Fetched Successfully", data: prayers });
    }
    const prayers = await PrayerService.getAll(req.user.id);
    return sendSuccess(res, { message: "All Prayers Fetched Successfully", data: prayers });
  }

  async getAllByUser(req, res) {
    const prayers = await PrayerService.getAllByUserId(req.user.id);
    return sendSuccess(res, { message: "My General Prayers Fetched Successfully", data: prayers });
  }

  async getSingle(req, res) {
    const { id } = req.params;
    if (!this.isValidId(id)) {
      return sendError(res, { message: "Invalid Prayer ID format", statusCode: 400 });
    }
    const prayer = await PrayerService.findById(id);
    if (!prayer)
      return sendError(res, { message: "Prayer Not Found", statusCode: 404 });

    return sendSuccess(res, { message: "Prayer Fetched Successfully", data: prayer });
  }

  async update(req, res) {
    const { id } = req.params;
    if (!this.isValidId(id)) {
      return sendError(res, { message: "Invalid Prayer ID format", statusCode: 400 });
    }
    const prayer = await PrayerService.findById(id);
    if (!prayer)
      return sendError(res, { message: "Prayer Not Found", statusCode: 404 });

    const updated = await PrayerService.update(id, req.body);
    return sendSuccess(res, { message: "Prayer Updated Successfully", data: updated });
  }

  async delete(req, res) {
    const { id } = req.params;
    if (!this.isValidId(id)) {
      return sendError(res, { message: "Invalid Prayer ID format", statusCode: 400 });
    }
    const prayer = await PrayerService.findById(id); // Admin can delete any prayer
    if (!prayer)
      return sendError(res, { message: "Prayer Not Found", statusCode: 404 });

    await PrayerService.delete(id);
    return sendSuccess(res, { message: "Prayer Deleted Successfully", data: {} });
  }
}

export default new PrayerController();
