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

export const middlewareValidateCreatePayment = (req, res, next) => {
  const { error } = validateCreatePayment(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
};

export const middlewareValidateUpdatePayment = (req, res, next) => {
  const { error } = validateUpdatePayment(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
};
