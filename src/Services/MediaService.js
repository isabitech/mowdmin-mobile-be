import { MediaCategoryRepository } from "../repositories/MediaCategoryRepository.js";
import { MediaRepository } from "../repositories/MediaRepository.js";

export const createMedia = async (data) => {
  return await MediaRepository.create(data);
};

export const create = createMedia; // Alias

class MediaService {
  async createMedia(data) {
    return await MediaRepository.create(data);
  }
  async create(data) {
    return await this.createMedia(data);
  }


  async update(id, data) {
    const res = await this.findById(id);
    if (!res) return null;
    await res.update(data);
    return res;
  }

  async findById(id) {
    // Note: If you need category info, fetch it separately using MediaCategoryRepository
    return await MediaRepository.findById(id);
  }

  async getAll() {
    // Note: If you need category info, fetch it separately using MediaCategoryRepository
    return await MediaRepository.findAll({
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

export default new MediaService();
