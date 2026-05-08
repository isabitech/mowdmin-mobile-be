import mongoose from "mongoose";
import { sendSuccess, sendError } from "../core/response.js";
import TestimonyService from "../Services/TestimonyService.js";

class TestimonyCommentController {
  isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

  getComments = async (req, res) => {
    const { testimonyId } = req.params;
    if (!this.isValidId(testimonyId)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }

    const comments = await TestimonyService.getComments(testimonyId);
    return sendSuccess(res, {
      message: "Comments fetched successfully",
      data: comments,
    });
  };

  addComment = async (req, res) => {
    const { testimonyId } = req.params;
    const { comment } = req.body;
    if (!this.isValidId(testimonyId)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }

    if (!comment || !String(comment).trim()) {
      return sendError(res, {
        message: "Comment is required",
        statusCode: 400,
      });
    }

    const createdComment = await TestimonyService.addComment(
      testimonyId,
      req.user.id || req.user._id,
      comment,
    );

    if (!createdComment) {
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    }

    return sendSuccess(res, {
      message: "Comment added successfully",
      data: createdComment,
    });
  };

  deleteComment = async (req, res) => {
    const { commentId } = req.params;
    if (!this.isValidId(commentId)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }

    const result = await TestimonyService.deleteComment(
      commentId,
      req.user.id || req.user._id,
    );

    if (!result.success) {
      return sendError(res, {
        message: result.message || "Request failed",
        statusCode: result.message === "Forbidden" ? 403 : 404,
      });
    }

    return sendSuccess(res, {
      message: "Comment deleted successfully",
    });
  };
}

export default new TestimonyCommentController();
