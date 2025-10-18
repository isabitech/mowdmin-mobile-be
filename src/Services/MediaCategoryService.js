import MediaCategory from "../Models/MediaCategory.js";
import Media from "../Models/MediaModel.js";

class MediaCategoryService {
    async create(data) {
        return await MediaCategory.create(data);
    }

    async update(id, data) {
        const res = await this.findById(id);
        if (!res) return null;
        await res.update(data);
        return res;
    }

    async findById(id) {
        return await MediaCategory.findByPk(id, {
            include: [{ model: Media, as: "media", attributes: ["title", "description"] }],
        });
    }

    async getAll() {
        return await MediaCategory.findAll({
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
