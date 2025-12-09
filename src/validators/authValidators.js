import Joi from "joi";

const email = Joi.string().email().required();
const password = Joi.string().min(6).max(128).required();

export const validateRegister = (payload) =>
  Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email,
    password,
    language: Joi.string().valid("EN", "FR", "DE").default("EN"),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateLogin = (payload) =>
  Joi.object({
    email,
    password,
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateForgotPassword = (payload) =>
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

export const validateChangePassword = (payload) =>
  Joi.object({
    email,
    currentPassword: password,
    newPassword: password,
    confirmPassword: password.valid(Joi.ref("newPassword")).required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
