import PrayerService from "../Services/PrayerService.js";
import { success, customError } from "../Utils/helper.js";

class PrayerController {
  async create(req, res) {
    const data = { ...req.body, userId: req.user.id };
    const prayer = await PrayerService.create(data);
    return success(res, "Prayer Created Successfully", prayer);
  }

  async getAll(req, res) {
    const prayers = await PrayerService.getAll();
    return success(res, "All Prayers Fetched Successfully", prayers);
  }

  async getAllByUser(req, res) {
    const prayers = await PrayerService.getAllByUserId(req.user.id);
    return success(res, "User Prayers Fetched Successfully", prayers);
  }

  async getSingle(req, res) {
    const { id } = req.params;
    const prayer = await PrayerService.findById(id);
    if (!prayer)
      return customError(res, "Prayer Not Found", 404);

    return success(res, "Prayer Fetched Successfully", prayer);
  }

  async delete(req, res) {
    const { id } = req.params;
    const prayer = await PrayerService.findByIdForAUser(id, req.user.id);
    if (!prayer)
      return customError(res, "Prayer Not Found", 404);

    await prayer.destroy();
    return success(res, "Prayer Deleted Successfully");
  }
}

export default new PrayerController();
