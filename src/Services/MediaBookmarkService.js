import { MediaRepository } from "../repositories/MediaRepository.js";
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
        // Note: If you need media info, fetch it separately using MediaRepository
        return await MediaBookmarkRepository.findById(id);
    }

    async getAll() {
        // Note: If you need media info, fetch it separately using MediaRepository
        return await MediaBookmarkRepository.findAll({
            order: [["createdAt", "ASC"]],
        });
    }

    async delete(id) {
        const res = await this.findById(id);
        if (!res) return null;
        await res.destroy();
        return true;
    }

    async getAllByUserId(userId) {
        // Note: If you need media info, fetch it separately using MediaRepository
        return await MediaBookmarkRepository.findAllByUserId(userId, {
            order: [["createdAt", "ASC"]],
        });
    }
}

export default new MediaBookmarkService();
