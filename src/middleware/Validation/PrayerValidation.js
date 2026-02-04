import { body, validationResult } from "express-validator";
import { sendValidationError } from "../../core/response.js";
import { PrayerRequestRepository } from "../../repositories/PrayerRequestRepository.js";

export const validatePrayerCreate = [
  body("title")
    .notEmpty()
    .withMessage("Title is required"),
  body("description")
    .notEmpty()
    .withMessage("Description is required"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of URLs"),
  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean"),
  body("prayerRequestId")
    .optional()
    .custom(async (value) => {
      if (!value) return true;
      const request = await PrayerRequestRepository.findById(value);
      if (!request) throw new Error("Prayer request not found");
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, { statusCode: 400, errors: errors.array() });
    }
    next();
  },
];
