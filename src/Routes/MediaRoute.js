import express from "express";
import MediaController from "../Controllers/MediaController.js";
import { validateMediaCreate, validateMediaUpdate } from "../Middleware/Validation/MediaValidation.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { handleValidationErrors } from "../middleware/Validation/authValidation.js";
import { tryCatch } from "../Utils/try-catch.js";

const Media = express.Router();

Media.post("/", protectUser, validateMediaCreate, handleValidationErrors,tryCatch( MediaController.create));
Media.get("/", protectUser, tryCatch(MediaController.getAll));
Media.get("/:id", protectUser, tryCatch(MediaController.getOne));
Media.put("/:id", protectUser, validateMediaUpdate, handleValidationErrors,tryCatch( MediaController.update));
Media.delete("/:id", protectUser, tryCatch(MediaController.delete));

export default Media;
