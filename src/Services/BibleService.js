import { BibleRepository } from "../repositories/BibleRepository.js";

class BibleService {
  // Stories
  async getAllStories(pagination = {}) {
    return await BibleRepository.findAllStories(pagination);
  }

  async createStory(data) {
    return await BibleRepository.createStory(data);
  }

  // Verses
  async getAllVerses(pagination = {}) {
    return await BibleRepository.findAllVerses(pagination);
  }

  async getDailyVerse() {
    return await BibleRepository.findDailyVerse();
  }

  async createVerse(data) {
    return await BibleRepository.createVerse(data);
  }
}

export default new BibleService();
