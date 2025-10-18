import MediaCategory from "../Models/MediaCategory.js";
import Media from "../Models/MediaModel.js";

class MediaService {
  async create(data) {
    return await Media.create(data);
  }

  async update(id, data) {
    const res = await this.findById(id);
    if (!res) return null;
    await res.update(data);
    return res;
  }

  async findById(id) {
    return await Media.findByPk(id, {
      include: [{ model: MediaCategory, as: "category", attributes: ["name"] }],
    });
  }

  async getAll() {
    return await Media.findAll({
      order: [["createdAt", "ASC"]],
      include: [{ model: MediaCategory, as: "category", attributes: ["name"] }],
    });
  }

  async delete(id) {
    const res = await this.findById(id);
    if (!res) return null;
    await res.destroy();
    return true;
  }
}

export default new MediaService();
