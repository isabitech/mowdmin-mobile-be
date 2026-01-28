import Joi from "joi";

export const validateCreateMediaCategory = (payload) =>
    Joi.object({
        name: Joi.string().min(2).max(255).required(),
        description: Joi.string().allow("", null),
    })
        .prefs({ stripUnknown: true })
        .validate(payload);

export const validateUpdateMediaCategory = (payload) =>
    Joi.object({
        name: Joi.string().min(2).max(255),
        description: Joi.string().allow("", null),
    })
        .prefs({ stripUnknown: true })
        .validate(payload);

export const middlewareValidateCreateMediaCategory = (req, res, next) => {
    const { error } = validateCreateMediaCategory(req.body);
    if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
    next();
};

export const middlewareValidateUpdateMediaCategory = (req, res, next) => {
    const { error } = validateUpdateMediaCategory(req.body);
    if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
    next();
};
