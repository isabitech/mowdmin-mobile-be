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

export const middlewareValidateCreateOrder = (req, res, next) => {
  const { error } = validateCreateOrder(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
};

export const middlewareValidateUpdateOrder = (req, res, next) => {
  const { error } = validateUpdateOrder(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
};
