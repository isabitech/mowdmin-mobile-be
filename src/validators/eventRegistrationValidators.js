import Joi from "joi";

export const joiValidateEventRegistration = (payload) =>
  Joi.object({
    eventId: Joi.string().uuid().required(),
    userId: Joi.string().uuid().required(),
    status: Joi.string().valid("pending", "approved", "rejected").default("pending"),
    note: Joi.string().allow("", null),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export function validateEventRegistration(req, res, next) {
  const { error } = joiValidateEventRegistration(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
}
