import PrayerService from "../Services/PrayerService.js";
import { sendSuccess, sendError } from "../core/response.js";

class PrayerController {
  async create(req, res) {
    const data = { ...req.body, userId: req.user.id };
    const prayer = await PrayerService.createPrayer(data);
    return sendSuccess(res, { message: "Prayer Created Successfully", data: prayer, statusCode: 201 });
  }
  async getAll(req, res) {
    const prayers = await PrayerService.getAll();
    return sendSuccess(res, { message: "All Prayers Fetched Successfully", data: prayers });
  }
  async getAllByUser(req, res) {
    const prayers = await PrayerService.getAllByUserId(req.user.id);
    return sendSuccess(res, { message: "User Prayers Fetched Successfully", data: prayers });
  }
  async getSingle(req, res) {
    const { id } = req.params;
    const prayer = await PrayerService.findById(id);
    if (!prayer)
      return sendError(res, { message: "Prayer Not Found", statusCode: 404 });

    return sendSuccess(res, { message: "Prayer Fetched Successfully", data: prayer });
  }
  async delete(req, res) {
    const { id } = req.params;
    const prayer = await PrayerService.findByIdForAUser(id, req.user.id);
    if (!prayer)
      return sendError(res, { message: "Prayer Not Found", statusCode: 404 });

    await prayer.destroy();
    return sendSuccess(res, { message: "Prayer Deleted Successfully", data: {} });
  }
}

export default new PrayerController();
