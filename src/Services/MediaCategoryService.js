import { MediaRepository } from "../repositories/MediaRepository.js";
import { MediaCategoryRepository } from "../repositories/MediaCategoryRepository.js";

class MediaCategoryService {
    async create(data) {
        return await MediaCategoryRepository.create(data);
    }

    async update(id, data) {
        const res = await this.findById(id);
        if (!res) return null;
        await res.update(data);
        return res;
    }

    async findById(id) {
        // Note: If you need media info, fetch it separately using MediaRepository
        return await MediaCategoryRepository.findById(id);
    }

    async getAll() {
        // Note: If you need media info, fetch it separately using MediaRepository
        return await MediaCategoryRepository.findAll({
            order: [["createdAt", "ASC"]],
        });
    }

    async delete(id) {
        const res = await this.findById(id);
        if (!res) return null;
        await res.destroy();
        return true;
    }
}

export default new MediaCategoryService();
