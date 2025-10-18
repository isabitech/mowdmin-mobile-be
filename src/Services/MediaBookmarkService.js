import MediaBookmark from "../Models/MediaBookmarksModel.js";
import Media from "../Models/MediaModel.js";

class MediaBookmarkService {
    async create(data) {
        return await MediaBookmark.create(data);
    }

    async update(id, data) {
        const res = await this.findById(id);
        if (!res) return null;
        await res.update(data);
        return res;
    }

    async findById(id) {
        return await MediaBookmark.findByPk(id, {
            include: [{ model: Media, as: "media", attributes: ["title", "description"] }],
        });
    }

    async getAll() {
        return await MediaBookmark.findAll({
            order: [["createdAt", "ASC"]],
            include: [{ model: Media, as: "media", attributes: ["title", "description"] }],
        });
    }

    async delete(id) {
        const res = await this.findById(id);
        if (!res) return null;
        await res.destroy();
        return true;
    }

    async getAllByUserId(userId) {
        return await MediaBookmark.findAll({
            where: { userId },
            order: [["createdAt", "ASC"]],
            include: [{ model: Media, as: "media", attributes: ["title", "description"] }],
        });
    }
}

export default new MediaBookmarkService();
