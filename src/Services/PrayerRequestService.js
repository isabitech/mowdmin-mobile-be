import { PrayerRequestRepository } from "../repositories/PrayerRequestRepository.js";

class PrayerRequestService {
  async getModels() {
    let User, Profile;
    if (process.env.DB_CONNECTION !== "mongodb") {
      User = (await import("../Models/UserModel.js")).default;
      Profile = (await import("../Models/ProfileModel.js")).default;
    } else {
      User = (await import("../MongoModels/UserMongoModel.js")).default;
      Profile = (await import("../MongoModels/ProfileMongoModel.js")).default;
    }
    return { User, Profile };
  }

  async createPrayerRequest(data) {
    return this.create(data);
  }

  async create(data) {
    return PrayerRequestRepository.create(data);
  }
  async update(id, data) {
    return PrayerRequestRepository.updateById(id, data);
  }
  async findById(id) {
    return PrayerRequestRepository.findById(id);
  }
  async findByIdForAUser(id, userId) {
    return PrayerRequestRepository.findOne({ id, userId });
  }
  async getAll(pagination = {}) {
    return PrayerRequestRepository.findAll({
      order: [["createdAt", "DESC"]],
      ...pagination,
    });
  }
  async delete(id) {
    return PrayerRequestRepository.deleteById(id);
  }
  async getAllByUserId(userId, pagination = {}) {
    return PrayerRequestRepository.findAllByUserId(userId, {
      order: [["createdAt", "DESC"]],
      ...pagination,
    });
  }
}

export default new PrayerRequestService();
