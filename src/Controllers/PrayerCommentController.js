import PrayerService from "../Services/PrayerService.js";
import { sendSuccess, sendError } from "../core/response.js";

class PrayerCommentController {
  async comment(req, res) {
    const { id } = req.params;
    const { comment } = req.body;
    if (!comment) return sendError(res, { message: "Comment is required", statusCode: 400 });

    const newComment = await PrayerService.commentPrayer(id, req.user.id, comment);
    if (!newComment) return sendError(res, { message: "Prayer Not Found", statusCode: 404 });
    return sendSuccess(res, { message: "Comment Added", data: newComment });
  }

  async getComments(req, res) {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    const data = await PrayerService.getComments(id, { limit: parseInt(limit), offset: parseInt(offset) });
    return sendSuccess(res, { message: "Comments Fetched", data });
  }

  async deleteComment(req, res) {
    const { commentId } = req.params;
    const result = await PrayerService.deleteComment(commentId, req.user.id);
    if (!result.success) {
      return sendError(res, { message: result.message || "Failed to delete comment", statusCode: result.message === "Unauthorized to delete this comment" ? 403 : 404 });
    }
    return sendSuccess(res, { message: "Comment Deleted" });
  }
}

export default new PrayerCommentController();
