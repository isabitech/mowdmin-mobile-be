import PrayerService from "../Services/PrayerService.js";
import { sendSuccess, sendError } from "../core/response.js";

class PrayerCommentController {
  async comment(req, res) {
    const { id } = req.params;
    const { comment } = req.body;
    const prayer = await PrayerService.commentPrayer(id, req.user.id, comment);
    if (!prayer) return sendError(res, { message: "Prayer Not Found", statusCode: 404 });
    return sendSuccess(res, { message: "Comment Added", data: prayer });
  }
}

export default new PrayerCommentController();
