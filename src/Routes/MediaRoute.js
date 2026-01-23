import { Router } from "express";
import MediaController from "../Controllers/MediaController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";
import { validateCreateMedia, validateUpdateMedia } from "../validators/mediaValidators.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";

const media = Router();

media.post(
	"/",
	protectUser,
	validateCreateMedia,
	handleValidationErrors,
	tryCatch(MediaController.create)
);
media.get("/", protectUser, tryCatch(MediaController.getAll));
media.get("/:id", protectUser, tryCatch(MediaController.getOne));
media.put(
	"/:id",
	protectUser,
	validateUpdateMedia,
	handleValidationErrors,
	tryCatch(MediaController.update)
);
media.delete("/:id", protectUser, tryCatch(MediaController.delete));

export default media;
