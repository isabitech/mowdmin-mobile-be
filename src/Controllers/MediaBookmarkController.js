import MediaBookmarkService from "../Services/MediaBookmarkService.js";
import { sendSuccess, sendError } from "../core/response.js";
import {
  validateCreateMediaBookmark,
  validateUpdateMediaBookmark,
} from "../middleware/Validation/MediaBookmarkValidation.js";
import { paginate } from "../Utils/helper.js";

const normalizeId = (value) => {
  if (!value) return null;
  if (typeof value === "object") {
    return value._id || value.id || value;
  }
  return value;
};

class MediaBookmarkController {
  async create(req, res, next) {
    const { error, value } = validateCreateMediaBookmark(req.body);
    if (error) {
      return sendError(res, {
        message: error.details[0].message,
        statusCode: 400,
      });
    }

    const data = { ...value, userId: req.user.id };
    const bookmark = await MediaBookmarkService.createMediaBookmark(data);
    return sendSuccess(res, {
      message: "Bookmark Created Successfully",
      data: bookmark,
      statusCode: 201,
    });
  }
  async getAll(req, res, next) {
    const userId = req.user?.id;
    const { page, limit: pageSize } = req.query;
    const hasPagination = page !== undefined || pageSize !== undefined;
    const pagination = hasPagination ? paginate(page || 1, pageSize) : null;

    let data;
    let meta = {};

    if (hasPagination) {
      const { items, total } =
        await MediaBookmarkService.getAllMediaBookmarksByUserIdWithCount(
          userId,
          pagination,
        );
      data = items;
      const pageNum = Number.parseInt(page || 1, 10);
      const limitNum = pagination?.limit;
      meta = {
        totalItems: total,
        totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
        currentPage: pageNum,
        pageSize: limitNum,
      };
    } else {
      data = await MediaBookmarkService.getAllMediaBookmarksByUserId(userId);
    }
    return sendSuccess(res, {
      message: "All Bookmarks Fetched Successfully",
      data,
      meta,
    });
  }
  async getAllByUser(req, res, next) {
    const userId = req.user?.id;
    const { page, limit: pageSize } = req.query;
    const hasPagination = page !== undefined || pageSize !== undefined;
    const pagination = hasPagination ? paginate(page || 1, pageSize) : null;

    let data;
    let meta = {};

    if (hasPagination) {
      const { items, total } =
        await MediaBookmarkService.getAllMediaBookmarksByUserIdWithCount(
          userId,
          pagination,
        );
      data = items;
      const pageNum = Number.parseInt(page || 1, 10);
      const limitNum = pagination?.limit;
      meta = {
        totalItems: total,
        totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
        currentPage: pageNum,
        pageSize: limitNum,
      };
    } else {
      data = await MediaBookmarkService.getAllMediaBookmarksByUserId(userId);
    }
    return sendSuccess(res, {
      message: "User Bookmarks Fetched Successfully",
      data,
      meta,
    });
  }
  async getOne(req, res, next) {
    const bookmark = await MediaBookmarkService.findById(req.params.id);
    if (!bookmark) {
      return sendError(res, { message: "Resource not found", statusCode: 404 });
    }
    const ownerId = normalizeId(bookmark.userId);
    if (ownerId?.toString() !== req.user.id.toString() && !req.user.isAdmin) {
      return sendError(res, { message: "Forbidden", statusCode: 403 });
    }
    return sendSuccess(res, {
      message: "Bookmark Fetched Successfully",
      data: bookmark,
    });
  }
  async update(req, res, next) {
    const { error, value } = validateUpdateMediaBookmark(req.body);
    if (error) {
      return sendError(res, {
        message: error.details[0].message,
        statusCode: 400,
      });
    }
    const existing = await MediaBookmarkService.findById(req.params.id);
    if (!existing) {
      return sendError(res, { message: "Resource not found", statusCode: 404 });
    }
    const ownerId = normalizeId(existing.userId);
    if (ownerId?.toString() !== req.user.id.toString() && !req.user.isAdmin) {
      return sendError(res, { message: "Forbidden", statusCode: 403 });
    }

    const updated = await MediaBookmarkService.updateMediaBookmark(
      req.params.id,
      value,
    );
    return sendSuccess(res, {
      message: "Bookmark Updated Successfully",
      data: updated,
    });
  }
  async delete(req, res, next) {
    const existing = await MediaBookmarkService.findById(req.params.id);
    if (!existing) {
      return sendError(res, { message: "Resource not found", statusCode: 404 });
    }
    const ownerId = normalizeId(existing.userId);
    if (ownerId?.toString() !== req.user.id.toString() && !req.user.isAdmin) {
      return sendError(res, { message: "Forbidden", statusCode: 403 });
    }

    await MediaBookmarkService.deleteMediaBookmark(req.params.id);
    return sendSuccess(res, {
      message: "Bookmark Deleted Successfully",
      data: {},
    });
  }
}

export default new MediaBookmarkController();
