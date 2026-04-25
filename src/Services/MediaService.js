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
    return await MediaRepository.updateById(id, data);
  }

  async findById(id) {
    return await MediaRepository.findById(id);
  }

  async getAll(filters = {}, pagination = {}) {
    return await MediaRepository.findAll({ where: filters, ...pagination });
  }

  async getAllWithCount(filters = {}, pagination = {}) {
    return await MediaRepository.findAllWithCount({
      where: filters,
      ...pagination,
    });
  }

  async delete(id) {
    const media = await this.findById(id);
    if (!media) return null;
    return await MediaRepository.deleteById(id);
  }
}

export default new MediaService();
