import Media from "../Models/MediaModel.js";
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
        return await MediaCategoryRepository.findById(id, {
            include: [{ model: Media, as: "media", attributes: ["title", "description"] }],
        });
    }

    async getAll() {
        return await MediaCategoryRepository.findAll({
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
}

export default new MediaCategoryService();
