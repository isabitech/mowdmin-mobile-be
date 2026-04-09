import PrayerService from "../Services/PrayerService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { PrayerLikeRepository } from "../repositories/PrayerLikeRepository.js";

class PrayerLikeController {
  async like(req, res) {
    const { id } = req.params;
    // Prevent invalid IDs (e.g., bad ObjectId strings) from causing server errors
    if (!PrayerLikeRepository.isValidId(id)) {
      return sendError(res, { message: "Invalid request", statusCode: 400 });
    }
    const result = await PrayerService.likePrayer(id, req.user.id);
    if (!result) return sendError(res, { message: "Resource not found", statusCode: 404 });
    return sendSuccess(res, { message: result.liked ? "Prayer Liked" : "Prayer Unliked", data: result });
  }

  async getUserLikes(req, res) {
    const { limit = 20, offset = 0 } = req.query;
    const likes = await PrayerService.getUserLikes(req.user.id, { limit: parseInt(limit), offset: parseInt(offset) });
    return sendSuccess(res, { message: "User Likes Fetched", data: likes });
  }
  async unlike(req, res) {
    const { id } = req.params;
    if (!PrayerLikeRepository.isValidId(id)) {
      return sendError(res, { message: "Invalid request", statusCode: 400 });
    }
    const result = await PrayerService.unlikePrayer(id, req.user.id);
    if (!result) return sendError(res, { message: "Resource not found", statusCode: 404 });
    return sendSuccess(res, { message: result.liked ? "Prayer Liked" : "Prayer Unliked", data: result });
  }
}

export default new PrayerLikeController();
