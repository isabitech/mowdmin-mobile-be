import { MediaRepository } from "../repositories/MediaRepository.js";
import { MediaCategoryRepository } from "../repositories/MediaCategoryRepository.js";

class MediaCategoryService {
    async createMediaCategory(data) {
        return await MediaCategoryRepository.create(data);
    }

    async updateMediaCategory(id, data) {
        return await MediaCategoryRepository.updateById(id, data);
    }

    async findById(id) {
        return await MediaCategoryRepository.findById(id);
    }

    async getAllMediaCategories() {
        return await MediaCategoryRepository.findAll({
            order: [["createdAt", "ASC"]],
        });
    }

    async deleteMediaCategory(id) {
        const res = await this.findById(id);
        if (!res) return null;
        await res.destroy();
        return true;
    }
}

export default new MediaCategoryService();
