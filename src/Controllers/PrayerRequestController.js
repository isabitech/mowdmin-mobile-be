import PrayerRequestService from "../Services/PrayerRequestService.js";
import { success, customError } from "../Utils/helper.js";

class PrayerRequestController {
  async create(req, res) {
    const data = { ...req.body, userId: req.user.id };
    const result = await PrayerRequestService.create(data);
    return success(res, "Prayer Request Created Successfully", result);
  }

  async update(req, res) {
    const { id } = req.params;
    const request = await PrayerRequestService.findByIdForAUser(id, req.user.id);

    if (!request)
      return customError(res, "Prayer Request Not Found", 404);

    const updated = await request.update(req.body);
    return success(res, "Prayer Request Updated Successfully", updated);
  }

  async getAll(req, res) {
    const requests = await PrayerRequestService.getAll();
    return success(res, "All Prayer Requests Fetched Successfully", requests);
  }

  async getAllByUser(req, res) {
    const requests = await PrayerRequestService.getAllByUserId(req.user.id);
    return success(res, "User Prayer Requests Fetched Successfully", requests);
  }

  async getSingle(req, res) {
    const { id } = req.params;
    const request = await PrayerRequestService.findById(id);
    if (!request)
      return customError(res, "Prayer Request Not Found", 404);

    return success(res, "Prayer Request Fetched Successfully", request);
  }

  async delete(req, res) {
    const { id } = req.params;
    const request = await PrayerRequestService.findByIdForAUser(id, req.user.id);

    if (!request)
      return customError(res, "Prayer Request Not Found", 404);

    await request.destroy();
    return success(res, "Prayer Request Deleted Successfully");
  }
}

export default new PrayerRequestController();
