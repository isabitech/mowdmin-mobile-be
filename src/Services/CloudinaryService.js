import cloudinary from "../Config/cloudinary.js";

class CloudinaryService {
  /**
   * Upload a file buffer to Cloudinary.
   * @param {Buffer} fileBuffer - The file buffer from multer memory storage
   * @param {object} options - Upload options
   * @param {string} [options.folder] - Cloudinary folder name
   * @param {string} [options.resourceType] - Resource type (image, video, raw)
   * @returns {Promise<{url: string, publicId: string}>}
   */
  static async upload(fileBuffer, { folder = "mowdmin", resourceType = "image" } = {}) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      stream.end(fileBuffer);
    });
  }

  /**
   * Delete a file from Cloudinary by its public ID.
   * @param {string} publicId - The Cloudinary public ID
   * @returns {Promise<object>}
   */
  static async delete(publicId) {
    return cloudinary.uploader.destroy(publicId);
  }
}

export default CloudinaryService;
