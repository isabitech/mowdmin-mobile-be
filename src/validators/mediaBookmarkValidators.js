import Joi from "joi";

export const validateCreateMediaBookmark = (payload) =>
  Joi.object({
    userId: Joi.string().required(),
    mediaId: Joi.string().required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateUpdateMediaBookmark = (payload) =>
  Joi.object({
    userId: Joi.string(),
    mediaId: Joi.string(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
