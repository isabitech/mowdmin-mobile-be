import { Router } from "express";
import MediaBookmarkController from "../Controllers/MediaBookmarkController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";
import { validateMediaBookmarkCreate, validateMediaBookmarkUpdate } from "../middleware/Validation/MediaBookmarkValidation.js";

const mediaBookmark = Router();

mediaBookmark.post(
	"/create",
	protectUser,
	validateMediaBookmarkCreate,
	handleValidationErrors,
	tryCatch(MediaBookmarkController.create)
);
mediaBookmark.get("/", protectUser, tryCatch(MediaBookmarkController.getAll));
mediaBookmark.get("/user/:userId", protectUser, tryCatch(MediaBookmarkController.getAllByUser));
mediaBookmark.get("/:id", protectUser, tryCatch(MediaBookmarkController.getOne));
mediaBookmark.put(
	"/:id",
	protectUser,
	validateMediaBookmarkUpdate,
	handleValidationErrors,
	tryCatch(MediaBookmarkController.update)
);
mediaBookmark.delete("/:id", protectUser, tryCatch(MediaBookmarkController.delete));

export default mediaBookmark;
