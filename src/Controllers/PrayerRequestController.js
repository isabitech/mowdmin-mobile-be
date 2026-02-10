import PrayerRequestService from "../Services/PrayerRequestService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreatePrayerRequest, validateUpdatePrayerRequest } from "../middleware/Validation/PrayerRequestValidation.js";
import mongoose from "mongoose";

class PrayerRequestController {
  // Helper to validate ObjectId
  isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  }

  create = async (req, res) => {
    const data = { ...req.body, userId: req.user.id };
    const result = await PrayerRequestService.create(data);
    return sendSuccess(res, { message: "Prayer Request Created Successfully", data: result, statusCode: 201 });
  }

  update = async (req, res) => {
    const { id } = req.params;
    if (!this.isValidId(id)) {
      return sendError(res, { message: "Invalid Prayer Request ID format", statusCode: 400 });
    }
    const request = await PrayerRequestService.findById(id);

    if (!request)
      return sendError(res, { message: "Prayer Request Not Found", statusCode: 404 });

    // Check ownership or admin role
    if (req.user.role !== 'admin' && request.userId.toString() !== req.user.id.toString()) {
      return sendError(res, { message: "Unauthorized to update this prayer request", statusCode: 403 });
    }

    const updated = await PrayerRequestService.update(id, req.body);
    return sendSuccess(res, { message: "Prayer Request Updated Successfully", data: updated });
  }

  getAll = async (req, res) => {
    const requests = await PrayerRequestService.getAll();
    return sendSuccess(res, { message: "All Prayer Requests Fetched Successfully", data: requests });
  }

  getAllByUser = async (req, res) => {
    const requests = await PrayerRequestService.getAllByUserId(req.user.id);
    return sendSuccess(res, { message: "My Prayer Requests Fetched Successfully", data: requests });
  }

  getSingle = async (req, res) => {
    const { id } = req.params;
    if (!this.isValidId(id)) {
      return sendError(res, { message: "Invalid Prayer Request ID format", statusCode: 400 });
    }
    const request = await PrayerRequestService.findById(id);
    if (!request)
      return sendError(res, { message: "Prayer Request Not Found", statusCode: 404 });

    return sendSuccess(res, { message: "Prayer Request Fetched Successfully", data: request });
  }

  delete = async (req, res) => {
    const { id } = req.params;
    if (!this.isValidId(id)) {
      return sendError(res, { message: "Invalid Prayer Request ID format", statusCode: 400 });
    }
    const request = await PrayerRequestService.findById(id);

    if (!request)
      return sendError(res, { message: "Prayer Request Not Found", statusCode: 404 });

    // Check ownership or admin role
    if (req.user.role !== 'admin' && request.userId.toString() !== req.user.id.toString()) {
      return sendError(res, { message: "Unauthorized to delete this prayer request", statusCode: 403 });
    }

    await PrayerRequestService.delete(id);
    return sendSuccess(res, { message: "Prayer Request Deleted Successfully", data: {} });
  }
}

export default new PrayerRequestController();
