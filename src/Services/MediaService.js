import MediaCategory from "../Models/MediaCategory.js";
import { MediaRepository } from "../repositories/MediaRepository.js";

class MediaService {
  async create(data) {
    return await MediaRepository.create(data);
  }

  async update(id, data) {
    const res = await this.findById(id);
    if (!res) return null;
    await res.update(data);
    return res;
  }

  async findById(id) {
    return await MediaRepository.findById(id, {
      include: [{ model: MediaCategory, as: "category", attributes: ["name"] }],
    });
  }

  async getAll() {
    return await MediaRepository.findAll({
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
