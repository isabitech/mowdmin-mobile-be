import Joi from "joi";

export const validateCreateNotification = (payload) =>
  Joi.object({
    title: Joi.string().min(2).max(255).required(),
    message: Joi.string().min(1).required(),
    type: Joi.string().valid("info", "alert", "transaction", "system").default("info"),
    metadata: Joi.object().unknown(true).allow(null),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
