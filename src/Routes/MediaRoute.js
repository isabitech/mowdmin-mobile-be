import { Router } from "express";
import MediaController from "../Controllers/MediaController.js";
import { protectAdmin, protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";
import { middlewareValidateCreateMedia, middlewareValidateUpdateMedia } from "../middleware/Validation/MediaValidation.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";

const media = Router();

media.post(
	"/create",
	protectUser,
	protectAdmin,
	middlewareValidateCreateMedia,
	handleValidationErrors,
	tryCatch(MediaController.create)
);
media.get("/", protectUser, tryCatch(MediaController.getAll));
media.get("/:id", protectUser, tryCatch(MediaController.getOne));
media.put(
	"/:id",
	protectUser,
	protectAdmin,
	middlewareValidateUpdateMedia,
	handleValidationErrors,
	tryCatch(MediaController.update)
);
media.delete("/:id", protectUser, protectAdmin, tryCatch(MediaController.delete));

export default media;
