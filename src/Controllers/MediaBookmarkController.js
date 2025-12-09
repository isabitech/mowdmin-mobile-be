import MediaBookmarkService from "../Services/MediaBookmarkService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreateMediaBookmark, validateUpdateMediaBookmark } from "../validators/mediaBookmarkValidators.js";

class MediaBookmarkController {
    async create(req, res, next) {
        const { error, value } = validateCreateMediaBookmark(req.body);
        if (error) {
            return sendError(res, { message: error.details[0].message, statusCode: 400 });
        }

        const bookmark = await MediaBookmarkService.create(value);
        return sendSuccess(res, { message: "Bookmark Created Successfully", data: bookmark });
    }
    async getAll(req, res, next) {
        const bookmarks = await MediaBookmarkService.getAll();
        return sendSuccess(res, { message: "All Bookmarks Fetched Successfully", data: bookmarks });
    }
    async getAllByUser(req, res, next) {
        const { userId } = req.params;
        const bookmarks = await MediaBookmarkService.getAllByUserId(userId);
        return sendSuccess(res, { message: "User Bookmarks Fetched Successfully", data: bookmarks });
    }
    async getOne(req, res, next) {
        const bookmark = await MediaBookmarkService.findById(req.params.id);
        return sendSuccess(res, { message: "Bookmark Fetched Successfully", data: bookmark });
    }
    async update(req, res, next) {
        const { error, value } = validateUpdateMediaBookmark(req.body);
        if (error) {
            return sendError(res, { message: error.details[0].message, statusCode: 400 });
        }

        const updated = await MediaBookmarkService.update(req.params.id, value);
        return sendSuccess(res, { message: "Bookmark Updated Successfully", data: updated });
    }
    async delete(req, res, next) {
        await MediaBookmarkService.delete(req.params.id);
        return sendSuccess(res, { message: "Bookmark Deleted Successfully", data: {} });
    }
}

export default new MediaBookmarkController();
