import ProfileRepository from "../repositories/ProfileRepository.js";

class ProfileService {
  async getProfile(userId) {
    return ProfileRepository.findByUserId(userId);
  }

  async updateProfile(userId, dto) {
    const existingProfile = await ProfileRepository.findByUserId(userId);
    if (!existingProfile) {
      return ProfileRepository.create({ ...dto, userId });
    }
    return ProfileRepository.updateByUserId(userId, dto);
  }
}

export default new ProfileService();