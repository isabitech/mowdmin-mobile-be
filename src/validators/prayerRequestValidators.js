import Joi from "joi";

export const validateCreatePrayerRequest = (payload) =>
  Joi.object({
    title: Joi.string().min(2).max(255).required(),
    description: Joi.string().allow("", null),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateUpdatePrayerRequest = (payload) =>
  Joi.object({
    title: Joi.string().min(2).max(255),
    description: Joi.string().allow("", null),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
