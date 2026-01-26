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

export const middlewareValidateCreateProduct = (req, res, next) => {
  const { error } = validateCreateProduct(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
};

export const middlewareValidateUpdateProduct = (req, res, next) => {
  const { error } = validateUpdateProduct(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
};
