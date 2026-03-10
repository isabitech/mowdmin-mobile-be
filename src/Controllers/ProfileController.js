// ProfileController.js
import profileService from '../Services/ProfileService.js';
import { sendSuccess, sendError } from '../core/response.js';

// Normalize photo URL relative to BASE_URL when stored as a path
const formatPhotoUrl = (req, url) => {
  if (!url) return null;

  if (url.startsWith("http")) {
    return url;
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;

  return `${baseUrl}${cleanPath}`;
};

export class ProfileController {

  static async getProfile(req, res) {
    const userId = req.user.id;
    if (!userId) {
      return sendError(res, { message: "User ID is required", statusCode: 400 });
    }
    const profile = await profileService.getProfile(userId);
    if (!profile) {
      return sendError(res, { message: "Profile not found", statusCode: 404 });
    }
    const profileData = {
      ...profile.toJSON(),
      photoUrl: formatPhotoUrl(req, profile.photoUrl),
    };
    return sendSuccess(res, { message: "Profile retrieved successfully", data: profileData, statusCode: 200 });
  }
  static async updateProfile(req, res, next) {
    const userId = req.user.id;
    // Gracefully handle cases where body parsing fails (e.g., missing JSON/form parser)
    const { displayName, bio, location, phoneNumber, phone_number, birthdate } = req.body || {};
    const dto = {
      displayName,
      bio,
      location,
      phone_number: phoneNumber || phone_number,
      birthdate,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : undefined,

    };
    const updated = await profileService.updateProfile(userId, dto);
    const profileData = {
      ...updated.toJSON(),
      photoUrl: formatPhotoUrl(req, updated.photoUrl),
    };
    return sendSuccess(res, { message: "Profile updated successfully", data: profileData, statusCode: 200 });
  }
}