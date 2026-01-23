import { body, validationResult } from "express-validator";
import PrayerRequest from "../../Models/PrayerRequestModel.js";
import { error } from "../../Utils/helper.js";

export const validatePrayerCreate = [
  body("prayer_request_id")
    .notEmpty()
    .withMessage("Prayer request ID is required")
    .bail()
    .custom(async (value) => {
      const request = await PrayerRequest.findByPk(value);
      if (!request) throw new Error("Prayer request not found");
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, "Validation Error", errors.array());
    }
    next();
  },
];
