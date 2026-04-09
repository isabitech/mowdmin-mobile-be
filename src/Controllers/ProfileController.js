// ProfileController.js
import profileService from "../Services/ProfileService.js";
import CloudinaryService from "../Services/CloudinaryService.js";
import { sendSuccess, sendError } from "../core/response.js";

export class ProfileController {
  static async getProfile(req, res) {
    const userId = req.user.id;
    if (!userId) {
      return sendError(res, {
        message: "User ID is required",
        statusCode: 400,
      });
    }
    const profile = await profileService.getProfile(userId);
    if (!profile) {
      return sendError(res, { message: "Resource not found", statusCode: 404 });
    }
    return sendSuccess(res, {
      message: "Profile retrieved successfully",
      data: profile,
      statusCode: 200,
    });
  }
  static async updateProfile(req, res, next) {
    const userId = req.user.id;
    const { displayName, bio, location, phoneNumber, phone_number, birthdate } =
      req.body || {};
    const dto = {
      displayName,
      bio,
      location,
      phone_number: phoneNumber || phone_number,
      birthdate,
    };

    let existing = null;
    if (req.file) {
      // Delete old photo from Cloudinary before uploading new one
      existing = await profileService.getProfile(userId);
      if (existing?.photoUrl) {
        await CloudinaryService.deleteIfCloudinary(existing.photoUrl);
      }
      const { url } = await CloudinaryService.upload(req.file.buffer, {
        folder: "mowdmin/profiles",
      });
      dto.photoUrl = url;
    }

    const updated = await profileService.updateProfile(userId, dto, existing);
    return sendSuccess(res, {
      message: "Profile updated successfully",
      data: updated,
      statusCode: 200,
    });
  }
}
