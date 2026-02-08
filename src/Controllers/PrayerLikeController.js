import PrayerService from "../Services/PrayerService.js";
import { sendSuccess, sendError } from "../core/response.js";

class PrayerLikeController {
  async like(req, res) {
    const { id } = req.params;
    const result = await PrayerService.likePrayer(id, req.user.id);
    if (!result) return sendError(res, { message: "Prayer Not Found", statusCode: 404 });
    return sendSuccess(res, { message: result.liked ? "Prayer Liked" : "Prayer Unliked", data: result });
  }

  async getUserLikes(req, res) {
    const { limit = 20, offset = 0 } = req.query;
    const likes = await PrayerService.getUserLikes(req.user.id, { limit: parseInt(limit), offset: parseInt(offset) });
    return sendSuccess(res, { message: "User Likes Fetched", data: likes });
  }
}

export default new PrayerLikeController();
