// ProfileService.js
import ProfileRepository from "../repositories/ProfileRepository.js";


export const getProfile = async (userId) => {
  return ProfileRepository.findByUserId(userId);
};

export const updateProfile = async (userId, dto) => {
  return ProfileRepository.updateByUserId(userId, dto);
};

export default {
  getProfile,
  updateProfile,
};