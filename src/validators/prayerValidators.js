import Joi from "joi";

export const validateCreatePrayer = (payload) =>
  Joi.object({
    title: Joi.string().min(2).max(255).required(),
    content: Joi.string().min(1).required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const middlewareValidateCreatePrayer = (req, res, next) => {
  const { error } = validateCreatePrayer(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
};
