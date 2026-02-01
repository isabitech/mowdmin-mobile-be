// ProfileController.js
import profileService from '../Services/ProfileService.js';
import { sendSuccess } from '../core/response.js';

export class ProfileController {
  static async getProfile(req, res, next) {
    const userId = req.user.id;
    const profile = await profileService.getProfile(userId);
    return sendSuccess(res, { message: "Profile fetched successfully", data: profile });
  }

  static async updateProfile(req, res, next) {
    const userId = req.user.id;
    const { displayName, bio, location, phoneNumber, phone_number, birthdate } = req.body;
    const dto = {
      displayName,
      bio,
      location,
      phone_number: phoneNumber || phone_number,
      birthdate
    };
    const updated = await profileService.updateProfile(userId, dto);
    return sendSuccess(res, { message: "Profile updated successfully", data: updated });
  }
}