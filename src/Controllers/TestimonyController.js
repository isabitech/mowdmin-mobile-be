import mongoose from "mongoose";
import { sendSuccess, sendError } from "../core/response.js";
import TestimonyService from "../Services/TestimonyService.js";

class TestimonyController {
  isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

  getAll = async (req, res) => {
    const testimonies = await TestimonyService.getPublicTestimonies(
      req.user?.id || req.user?._id || null,
    );
    return sendSuccess(res, {
      message: "Testimonies fetched successfully",
      data: testimonies,
    });
  };

  getMyTestimonies = async (req, res) => {
    const testimonies = await TestimonyService.getUserTestimonies(
      req.user.id || req.user._id,
    );
    return sendSuccess(res, {
      message: "Testimonies fetched successfully",
      data: testimonies,
    });
  };

  create = async (req, res) => {
    const { title, description } = req.body;
    if (
      !title ||
      !String(title).trim() ||
      !description ||
      !String(description).trim()
    ) {
      return sendError(res, {
        message: "Title and description are required",
        statusCode: 400,
      });
    }

    const testimony = await TestimonyService.createTestimony(
      req.user.id || req.user._id,
      req.body,
    );
    return sendSuccess(res, {
      message: "Testimony created successfully",
      data: testimony,
      statusCode: 201,
    });
  };

  update = async (req, res) => {
    const { testimonyId } = req.params;
    if (!this.isValidId(testimonyId)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }

    if (
      (req.body.title !== undefined && !String(req.body.title).trim()) ||
      (req.body.description !== undefined &&
        !String(req.body.description).trim())
    ) {
      return sendError(res, {
        message: "Title and description cannot be empty",
        statusCode: 400,
      });
    }

    const updated = await TestimonyService.updateTestimony(
      testimonyId,
      req.user.id || req.user._id,
      req.body,
    );

    if (updated?.forbidden) {
      return sendError(res, {
        message: "Forbidden",
        statusCode: 403,
      });
    }

    if (!updated) {
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    }

    return sendSuccess(res, {
      message: "Testimony updated successfully",
      data: updated,
    });
  };

  delete = async (req, res) => {
    const { testimonyId } = req.params;
    if (!this.isValidId(testimonyId)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }

    const result = await TestimonyService.deleteTestimony(
      testimonyId,
      req.user.id || req.user._id,
    );

    if (result?.forbidden) {
      return sendError(res, {
        message: "Forbidden",
        statusCode: 403,
      });
    }

    if (!result) {
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    }

    return sendSuccess(res, {
      message: "Testimony deleted successfully",
    });
  };

  getTestimonyById = async (req, res) => {
    const { testimonyId } = req.params;
    if (!this.isValidId(testimonyId)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }
    const testimony = await TestimonyService.getTestimonyById(
      testimonyId,
      req.user?.id || req.user?._id || null,
    );
    if (!testimony) {
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    }
    return sendSuccess(res, {
      message: "Testimony fetched successfully",
      data: testimony,
    });
  };
}

export default new TestimonyController();
