import { Router } from "express";
import MediaController from "../Controllers/MediaController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";
import { middlewareValidateCreateMedia, middlewareValidateUpdateMedia } from "../validators/mediaValidators.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";

const media = Router();

media.post(
	"/create",
	protectUser,
	middlewareValidateCreateMedia,
	handleValidationErrors,
	tryCatch(MediaController.create)
);
media.get("/", protectUser, tryCatch(MediaController.getAll));
media.get("/:id", protectUser, tryCatch(MediaController.getOne));
media.put(
	"/:id",
	protectUser,
	middlewareValidateUpdateMedia,
	handleValidationErrors,
	tryCatch(MediaController.update)
);
media.delete("/:id", protectUser, tryCatch(MediaController.delete));

export default media;
