import { Router } from "express";
import TestimonyController from "../Controllers/TestimonyController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const testimony = Router();

const attachOptionalUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next();
  }

  return protectUser(req, res, (error) => {
    if (error && error.statusCode === 401) {
      return next();
    }
    if (error) {
      return next(error);
    }
    return next();
  });
};

testimony.get("/", attachOptionalUser, tryCatch(TestimonyController.getAll));
testimony.get(
  "/user",
  protectUser,
  tryCatch(TestimonyController.getMyTestimonies),
);
testimony.post("/create", protectUser, tryCatch(TestimonyController.create));
testimony.put(
  "/:testimonyId",
  protectUser,
  tryCatch(TestimonyController.update),
);
testimony.delete(
  "/:testimonyId",
  protectUser,
  tryCatch(TestimonyController.delete),
);
testimony.get(
  "/:testimonyId",
  attachOptionalUser,
  tryCatch(TestimonyController.getTestimonyById),
);
export default testimony;
