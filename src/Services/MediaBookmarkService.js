import Media from "../Models/MediaModel.js";
import { MediaBookmarkRepository } from "../repositories/MediaBookmarkRepository.js";

class MediaBookmarkService {
    async create(data) {
        return await MediaBookmarkRepository.create(data);
    }

    async update(id, data) {
        const res = await this.findById(id);
        if (!res) return null;
        await res.update(data);
        return res;
    }

    async findById(id) {
        return await MediaBookmarkRepository.findById(id, {
            include: [{ model: Media, as: "media", attributes: ["title", "description"] }],
        });
    }

    async getAll() {
        return await MediaBookmarkRepository.findAll({
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
        return await MediaBookmarkRepository.findAllByUserId(userId, {
            order: [["createdAt", "ASC"]],
            include: [{ model: Media, as: "media", attributes: ["title", "description"] }],
        });
    }
}

export default new MediaBookmarkService();
