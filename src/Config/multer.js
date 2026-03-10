import multer from "multer";

// Use memory storage so file buffers can be uploaded to Cloudinary
const storage = multer.memoryStorage();

// File filter for image validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed.");
    error.status = 400;
    return cb(error, false);
  }
  cb(null, true);
};

// Set file size limit (5 MB)
const limits = {
  fileSize: 5 * 1024 * 1024,
};

// Create upload middleware
const upload = multer({ storage, fileFilter, limits });

export default upload;
