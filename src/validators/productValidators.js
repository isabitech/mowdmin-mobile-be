import Joi from "joi";

export const validateCreateProduct = (payload) =>
  Joi.object({
    name: Joi.string().min(2).max(255).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().allow("", null),
    categoryId: Joi.string().required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateUpdateProduct = (payload) =>
  Joi.object({
    name: Joi.string().min(2).max(255),
    price: Joi.number().min(0),
    description: Joi.string().allow("", null),
    categoryId: Joi.string(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
