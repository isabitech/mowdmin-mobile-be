import Joi from "joi";

const email = Joi.string().email().required();
const password = Joi.string().min(6).max(128).required();


// Joi validation schemas (for use in services/controllers)
export const validateRegister = (payload) =>
  Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email,
    password,
    language: Joi.string().valid("EN", "FR", "DE").default("EN"),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const joiValidateLogin = (payload) =>
  Joi.object({
    email,
    password,
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const joiValidateForgotPassword = (payload) =>
  Joi.object({
    email,
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateResetPassword = (payload) =>
  Joi.object({
    email,
    token: Joi.string().required(),
    newPassword: password,
    confirmPassword: password.valid(Joi.ref("newPassword")).required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

// Express middleware for validation (for use in routes)
export function validateUserRegistration(req, res, next) {
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
}

export function validateUserLogin(req, res, next) {
  const { error } = joiValidateLogin(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
}

export function validateForgotPassword(req, res, next) {
  const { error } = joiValidateForgotPassword(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
}

export const validateChangePassword = (payload) =>
  Joi.object({
    email,
    currentPassword: password,
    newPassword: password,
    confirmPassword: password.valid(Joi.ref("newPassword")).required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
