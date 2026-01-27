import Joi from "joi";

export const validateCreateMediaBookmark = (payload) =>
  Joi.object({
    userId: Joi.string(),
    mediaId: Joi.string().required(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateUpdateMediaBookmark = (payload) =>
  Joi.object({
    userId: Joi.string(),
    mediaId: Joi.string(),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);
export const middlewareValidateCreateMediaBookmark = (req, res, next) => {
  const { error } = validateCreateMediaBookmark(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
};

export const middlewareValidateUpdateMediaBookmark = (req, res, next) => {
  const { error } = validateUpdateMediaBookmark(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  next();
};
