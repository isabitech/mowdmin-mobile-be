import MinistryService from "../Services/MinistryService.js";
import { sendSuccess, sendError } from "../core/response.js";
import mongoose from "mongoose";
import { paginate } from "../Utils/helper.js";

class MinistryController {
  // Helper to validate ObjectId
  isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  };

  getAllMinistries = async (req, res) => {
    const { page, limit: pageSize } = req.query;
    const ministries = await MinistryService.getAllMinistries(
      paginate(page || 1, pageSize),
    );
    return sendSuccess(res, {
      message: "Ministries fetched successfully",
      data: ministries,
    });
  };

  getMinistryById = async (req, res) => {
    if (!this.isValidId(req.params.id)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }
    const ministry = await MinistryService.getMinistryById(req.params.id);
    if (!ministry)
      return sendError(res, { message: "Resource not found", statusCode: 404 });
    return sendSuccess(res, {
      message: "Ministry fetched successfully",
      data: ministry,
    });
  };

  createMinistry = async (req, res) => {
    const ministry = await MinistryService.createMinistry(req.body);
    return sendSuccess(res, {
      message: "Ministry created successfully",
      data: ministry,
      statusCode: 201,
    });
  };

  updateMinistry = async (req, res) => {
    if (!this.isValidId(req.params.id)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }
    const ministry = await MinistryService.updateMinistry(
      req.params.id,
      req.body,
    );
    if (!ministry)
      return sendError(res, { message: "Resource not found", statusCode: 404 });
    return sendSuccess(res, {
      message: "Ministry updated successfully",
      data: ministry,
    });
  };

  deleteMinistry = async (req, res) => {
    if (!this.isValidId(req.params.id)) {
      return sendError(res, {
        message: "Invalid request",
        statusCode: 400,
      });
    }
    await MinistryService.deleteMinistry(req.params.id);
    return sendSuccess(res, {
      message: "Ministry deleted successfully",
      data: null,
    });
  };
}

export default new MinistryController();
