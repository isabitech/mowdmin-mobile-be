import ProfileRepository from "../repositories/ProfileRepository.js";

class ProfileService {
  async getProfile(userId) {
    return ProfileRepository.findByUserId(userId);
  }

  async updateProfile(userId, dto) {
    return ProfileRepository.updateByUserId(userId, dto);
  }
}

export default new ProfileService();