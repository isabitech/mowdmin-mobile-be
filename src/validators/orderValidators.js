import Joi from "joi";

export const validateCreateOrder = (payload) =>
  Joi.object({
    userId: Joi.string().required(),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required(),
    totalAmount: Joi.number().min(0).required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateUpdateOrder = (payload) =>
  Joi.object({
    status: Joi.string(),
    totalAmount: Joi.number().min(0),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
