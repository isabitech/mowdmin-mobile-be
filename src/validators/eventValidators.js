import Joi from "joi";


// Joi validation functions (for use in services/controllers)
export const joiValidateCreateEvent = (payload) =>
  Joi.object({
    title: Joi.string().min(2).max(255).required(),
    description: Joi.string().allow("", null),
    date: Joi.date().required(),
    time: Joi.string().required(),
    location: Joi.string().required(),
    type: Joi.string().required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const joiValidateUpdateEvent = (payload) =>
  Joi.object({
    title: Joi.string().min(2).max(255),
    description: Joi.string().allow("", null),
    date: Joi.date(),
    time: Joi.string(),
    location: Joi.string(),
    type: Joi.string(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

// Express middleware for validation (for use in routes)
export function validateEventCreate(req, res, next) {
  const { error } = joiValidateCreateEvent(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
}

export function validateEventUpdate(req, res, next) {
  const { error } = joiValidateUpdateEvent(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
}
