import ProfileRepository from "../repositories/ProfileRepository.js";
import fs from "fs";
import path from "path";
import { logger } from "../core/logger.js";

// Delete an existing local file when a new photo replaces it
const deleteLocalPhotoIfExists = async (photoUrl) => {
  if (!photoUrl) return;
  if (photoUrl.startsWith("http")) return;

  const relativePath = photoUrl.startsWith("/") ? photoUrl.slice(1) : photoUrl;
  const absolutePath = path.join(path.resolve(), relativePath);

  try {
    await fs.promises.unlink(absolutePath);
  } catch (err) {
    // Ignore missing files; rethrow other errors for visibility
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
};

class ProfileService {
  async getProfile(userId) {
    return ProfileRepository.findByUserId(userId);
  }

  async updateProfile(userId, dto, existingProfile = null) {
    const profile =
      existingProfile || (await ProfileRepository.findByUserId(userId));
    if (!profile) {
      return ProfileRepository.create({ ...dto, userId });
    }

    // If a new photo was uploaded, clean up the previous local file
    if (dto.photoUrl) {
      deleteLocalPhotoIfExists(profile.photoUrl).catch((error) => {
        logger.error("Failed to delete old profile photo", {
          userId,
          photoUrl: profile.photoUrl,
          message: error.message,
        });
      });
    }

    return ProfileRepository.updateByUserId(userId, dto);
  }
}

export default new ProfileService();
