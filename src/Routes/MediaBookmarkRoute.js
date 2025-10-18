import express from "express";
import MediaBookmarkController from "../Controllers/MediaBookmarkController.js";
import { validateMediaBookmarkCreate, validateMediaBookmarkDelete } from "../Middleware/Validation/MediaBookmarkValidation.js";
import { handleValidationErrors } from "../middleware/Validation/authValidation.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const MediaBookmark = express.Router();

MediaBookmark.post("/", protectUser, validateMediaBookmarkCreate, handleValidationErrors, tryCatch(MediaBookmarkController.create));
MediaBookmark.get("/", protectUser, tryCatch(MediaBookmarkController.getAll));
MediaBookmark.get("/user/:userId", protectUser, tryCatch(MediaBookmarkController.getAllByUser));
MediaBookmark.get("/:id", protectUser, tryCatch(MediaBookmarkController.getOne));
MediaBookmark.put("/:id", protectUser, validateMediaBookmarkCreate, handleValidationErrors, tryCatch(MediaBookmarkController.update));
MediaBookmark.delete("/:id", protectUser, validateMediaBookmarkDelete, tryCatch(MediaBookmarkController.delete));

export default MediaBookmark;
