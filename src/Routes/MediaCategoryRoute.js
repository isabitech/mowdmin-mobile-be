import { Router } from "express";
import MediaCategoryController from "../Controllers/MediaCategoryController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";
import { middlewareValidateCreateMediaCategory, middlewareValidateUpdateMediaCategory } from "../middleware/Validation/MediaCategoryValidation.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";

const mediaCategory = Router();

mediaCategory.post(
	"/create",
	protectUser,
	middlewareValidateCreateMediaCategory,
	handleValidationErrors,
	tryCatch(MediaCategoryController.create)
);
mediaCategory.get("/", protectUser, tryCatch(MediaCategoryController.getAll));
mediaCategory.get("/:id", protectUser, tryCatch(MediaCategoryController.getOne));
mediaCategory.put(
	"/:id",
	protectUser,
	middlewareValidateUpdateMediaCategory,
	handleValidationErrors,
	tryCatch(MediaCategoryController.update)
);
mediaCategory.delete("/:id", protectUser, tryCatch(MediaCategoryController.delete));

export default mediaCategory;
