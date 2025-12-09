import Joi from "joi";

export const validateCreatePayment = (payload) =>
  Joi.object({
    orderId: Joi.string().required(),
    amount: Joi.number().min(0).required(),
    method: Joi.string().required(),
    status: Joi.string().required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateUpdatePayment = (payload) =>
  Joi.object({
    amount: Joi.number().min(0),
    method: Joi.string(),
    status: Joi.string(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
