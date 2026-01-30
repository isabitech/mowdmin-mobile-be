import { BibleRepository } from "../repositories/BibleRepository.js";

class BibleService {
    // Stories
    async getAllStories() {
        return await BibleRepository.findAllStories();
    }

    async createStory(data) {
        return await BibleRepository.createStory(data);
    }

    // Verses
    async getAllVerses() {
        return await BibleRepository.findAllVerses();
    }

    async getDailyVerse() {
        return await BibleRepository.findDailyVerse();
    }

    async createVerse(data) {
        return await BibleRepository.createVerse(data);
    }
}

export default new BibleService();
