import Joi from "joi";

export const validateCreateEvent = (payload) =>
  Joi.object({
    title: Joi.string().min(2).max(255).required(),
    description: Joi.string().allow("", null),
    date: Joi.date().required(),
    time: Joi.string().required(),
    location: Joi.string().required(),
    type: Joi.string().required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateUpdateEvent = (payload) =>
  Joi.object({
    title: Joi.string().min(2).max(255),
    description: Joi.string().allow("", null),
    date: Joi.date(),
    time: Joi.string(),
    location: Joi.string(),
    type: Joi.string(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
