import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Determine upload directory
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, "uploads");

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize extension - only allow whitelisted extensions
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

    if (!allowedExts.includes(ext)) {
      return cb(new Error('Invalid file extension'), false);
    }

    // Use crypto for secure random filename
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

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
