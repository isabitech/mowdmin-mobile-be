import mongoose from "mongoose";
import { sendSuccess, sendError } from "../core/response.js";
import TestimonyService from "../Services/TestimonyService.js";

class TestimonyLikeController {
  isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

  toggleLike = async (req, res) => {
    const { testimonyId } = req.params;
    if (!this.isValidId(testimonyId)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }

    const result = await TestimonyService.toggleLike(
      testimonyId,
      req.user.id || req.user._id,
    );

    if (!result) {
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    }

    return sendSuccess(res, {
      message: "Testimony like toggled successfully",
      data: result,
    });
  };
}

export default new TestimonyLikeController();
