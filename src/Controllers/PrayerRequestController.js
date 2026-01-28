import PrayerRequestService from "../Services/PrayerRequestService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreatePrayerRequest, validateUpdatePrayerRequest } from "../middleware/Validation/PrayerRequestValidation.js";

class PrayerRequestController {
  async create(req, res) {
    const { error, value } = validateCreatePrayerRequest(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const data = { ...value, userId: req.user.id };
    const result = await PrayerRequestService.createPrayerRequest(data);
    return sendSuccess(res, { message: "Prayer Request Created Successfully", data: result, statusCode: 201 });
  }

  async update(req, res) {
    const { id } = req.params;
    const request = await PrayerRequestService.findByIdForAUser(id, req.user.id);

    if (!request)
      return sendError(res, { message: "Prayer Request Not Found", statusCode: 404 });
    const { error, value } = validateUpdatePrayerRequest(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const updated = await request.update(value);
    return sendSuccess(res, { message: "Prayer Request Updated Successfully", data: updated });
  }

  async getAll(req, res) {
    const requests = await PrayerRequestService.getAll();
    return sendSuccess(res, { message: "All Prayer Requests Fetched Successfully", data: requests });
  }

  async getAllByUser(req, res) {
    const requests = await PrayerRequestService.getAllByUserId(req.user.id);
    return sendSuccess(res, { message: "User Prayer Requests Fetched Successfully", data: requests });
  }

  async getSingle(req, res) {
    const { id } = req.params;
    const request = await PrayerRequestService.findById(id);
    if (!request)
      return sendError(res, { message: "Prayer Request Not Found", statusCode: 404 });

    return sendSuccess(res, { message: "Prayer Request Fetched Successfully", data: request });
  }

  async delete(req, res) {
    const { id } = req.params;
    const request = await PrayerRequestService.findByIdForAUser(id, req.user.id);

    if (!request)
      return sendError(res, { message: "Prayer Request Not Found", statusCode: 404 });

    await request.destroy();
    return sendSuccess(res, { message: "Prayer Request Deleted Successfully", data: {} });
  }
}

export default new PrayerRequestController();
