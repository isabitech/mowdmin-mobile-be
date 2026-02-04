import PrayerService from "../Services/PrayerService.js";
import { sendSuccess, sendError } from "../core/response.js";

class PrayerLikeController {
  async like(req, res) {
    const { id } = req.params;
    const prayer = await PrayerService.likePrayer(id, req.user.id);
    if (!prayer) return sendError(res, { message: "Prayer Not Found", statusCode: 404 });
    return sendSuccess(res, { message: "Prayer Liked", data: prayer });
  }
}

export default new PrayerLikeController();
