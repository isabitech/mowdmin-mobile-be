import Joi from "joi";

export const validateCreateMediaCategory = (payload) =>
  Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().allow("", null),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateUpdateMediaCategory = (payload) =>
  Joi.object({
    name: Joi.string().min(2).max(255),
    description: Joi.string().allow("", null),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
