import ProfileRepository from "../repositories/ProfileRepository.js";
import fs from "fs";
import path from "path";

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

  async updateProfile(userId, dto) {
    const existingProfile = await ProfileRepository.findByUserId(userId);
    if (!existingProfile) {
      return ProfileRepository.create({ ...dto, userId });
    }

    // If a new photo was uploaded, clean up the previous local file
    if (dto.photoUrl) {
      await deleteLocalPhotoIfExists(existingProfile.photoUrl);
    }

    await ProfileRepository.updateByUserId(userId, dto);
    // Fetch the updated profile to return a consistent instance/document
    return ProfileRepository.findByUserId(userId);
  }
}

export default new ProfileService();