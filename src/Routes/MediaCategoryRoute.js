import { Router } from "express";
import MediaCategoryController from "../Controllers/MediaCategoryController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";
import { middlewareValidateCreateMediaCategory, middlewareValidateUpdateMediaCategory } from "../middleware/Validation/MediaCategoryValidation.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";

const mediaCategory = Router();

mediaCategory.post(
	"/create",
	protectUser,
	protectAdmin,
	middlewareValidateCreateMediaCategory,
	handleValidationErrors,
	tryCatch(MediaCategoryController.create)
);
mediaCategory.get("/", protectUser, protectAdmin, tryCatch(MediaCategoryController.getAll));
mediaCategory.get("/:id", protectUser, protectAdmin, tryCatch(MediaCategoryController.getOne));
mediaCategory.put(
	"/:id",
	protectUser,
	protectAdmin,
	middlewareValidateUpdateMediaCategory,
	handleValidationErrors,
	tryCatch(MediaCategoryController.update)
);
mediaCategory.delete("/:id", protectUser, protectAdmin, tryCatch(MediaCategoryController.delete));

export default mediaCategory;
