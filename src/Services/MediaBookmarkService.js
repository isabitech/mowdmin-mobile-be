import { MediaRepository } from "../repositories/MediaRepository.js";
import { MediaBookmarkRepository } from "../repositories/MediaBookmarkRepository.js";

class MediaBookmarkService {
  async createMediaBookmark(data) {
    return await MediaBookmarkRepository.create(data);
  }

  async updateMediaBookmark(id, data) {
    return await MediaBookmarkRepository.updateById(id, data);
  }

  async findById(id) {
    return await MediaBookmarkRepository.findById(id);
  }

  async getAllMediaBookmarks() {
    return await MediaBookmarkRepository.findAll({
      order: [["createdAt", "ASC"]],
    });
  }

  async deleteMediaBookmark(id) {
    return await MediaBookmarkRepository.deleteById(id);
  }

  async getAllMediaBookmarksByUserId(userId) {
    return await MediaBookmarkRepository.findAllByUserId(userId, {
      order: [["createdAt", "ASC"]],
    });
  }
}

export default new MediaBookmarkService();
