import MediaBookmarkService from "../Services/MediaBookmarkService.js";
import { success } from "../Utils/helper.js";

class MediaBookmarkController {
    async create(req, res, next) {
        const data = { ...req.body };
        const bookmark = await MediaBookmarkService.create(data);

        return success(res, "Bookmark Created Successfully", bookmark);
    }

    async getAll(req, res, next) {
        const bookmarks = await MediaBookmarkService.getAll();
        return success(res, "All Bookmarks Fetched Successfully", bookmarks);
    }

    async getAllByUser(req, res, next) {
        const { userId } = req.params;
        const bookmarks = await MediaBookmarkService.getAllByUserId(userId);
        return success(res, "User Bookmarks Fetched Successfully", bookmarks);
    }

    async getOne(req, res, next) {
        const bookmark = await MediaBookmarkService.findById(req.params.id);
        return success(res, "Bookmark Fetched Successfully", bookmark);
    }

    async update(req, res, next) {
        const updated = await MediaBookmarkService.update(req.params.id, req.body);
        return success(res, "Bookmark Updated Successfully", updated);
    }

    async delete(req, res, next) {
        await MediaBookmarkService.delete(req.params.id);
        return success(res, "Bookmark Deleted Successfully");
    }
}

export default new MediaBookmarkController();
