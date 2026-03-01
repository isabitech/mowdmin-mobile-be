import { body, validationResult } from "express-validator";
import { sendValidationError } from "../../core/response.js";
import { PrayerRequestRepository } from "../../repositories/PrayerRequestRepository.js";

export const validatePrayerCreate = [
  body("prayer_request_id")
    .notEmpty()
    .withMessage("Prayer request ID is required")
    .bail()
    .custom(async (value) => {
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
