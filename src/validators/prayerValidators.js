import Joi from "joi";

export const validateCreatePrayer = (payload) =>
  Joi.object({
    title: Joi.string().min(2).max(255).required(),
    content: Joi.string().min(1).required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
