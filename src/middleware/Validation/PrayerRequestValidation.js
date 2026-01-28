import Joi from "joi";

export const validateCreatePrayerRequest = (payload) =>
    Joi.object({
        title: Joi.string().min(2).max(255).required(),
        description: Joi.string().allow("", null),
    })
        .prefs({ stripUnknown: true })
        .validate(payload);

export const validateUpdatePrayerRequest = (payload) =>
    Joi.object({
        title: Joi.string().min(2).max(255),
        description: Joi.string().allow("", null),
    })
        .prefs({ stripUnknown: true })
        .validate(payload);

export const middlewareValidateCreatePrayerRequest = (req, res, next) => {
    const { error } = validateCreatePrayerRequest(req.body);
    if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
    next();
};

export const middlewareValidateUpdatePrayerRequest = (req, res, next) => {
    const { error } = validateUpdatePrayerRequest(req.body);
    if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
    next();
};
