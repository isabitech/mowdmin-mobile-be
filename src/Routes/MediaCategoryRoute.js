import express from "express";
import MediaCategoryController from "../Controllers/MediaCategoryController.js";
import { validateMediaCategoryCreate, validateMediaCategoryUpdate } from "../middleware/Validation/MediaCategoryValidation.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { handleValidationErrors } from "../middleware/Validation/authValidation.js";
import { tryCatch } from "../Utils/try-catch.js";
const MediaCategory = express.Router();

MediaCategory.post("/", protectUser, validateMediaCategoryCreate, handleValidationErrors, tryCatch(MediaCategoryController.create));
MediaCategory.get("/", protectUser, tryCatch(MediaCategoryController.getAll));
MediaCategory.get("/:id", protectUser, tryCatch(MediaCategoryController.getOne));
MediaCategory.put("/:id", protectUser, validateMediaCategoryUpdate, handleValidationErrors, tryCatch(MediaCategoryController.update));
MediaCategory.delete("/:id", protectUser, tryCatch(MediaCategoryController.delete));

export default MediaCategory;
