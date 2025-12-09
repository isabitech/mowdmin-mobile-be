import PrayerService from "../Services/PrayerService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreatePrayer } from "../validators/prayerValidators.js";
class PrayerController {
  async create(req, res) {
    const { error, value } = validateCreatePrayer(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const data = { ...value, userId: req.user.id };
    const prayer = await PrayerService.create(data);
    return sendSuccess(res, { message: "Prayer Created Successfully", data: prayer });
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
