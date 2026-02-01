import Joi from "joi";

export const validateCreateMedia = (payload) =>
    Joi.object({
        title: Joi.string().min(2).max(255).required(),
        description: Joi.string().allow("", null),
        category_id: Joi.string().required(),
        type: Joi.string().valid("audio", "video", "text").required(),
        media_url: Joi.string().uri().allow("", null),
        author: Joi.string().allow("", null),
        duration: Joi.string().allow("", null),
        is_downloadable: Joi.boolean(),
        language: Joi.string().allow("", null),
        thumbnail: Joi.string().uri().allow("", null),
        youtubeLiveLink: Joi.string().uri().allow("", null),
        isLive: Joi.boolean(),
    })
        .prefs({ stripUnknown: true })
        .validate(payload);

export const validateUpdateMedia = (payload) =>
    Joi.object({
        title: Joi.string().min(2).max(255),
        description: Joi.string().allow("", null),
        category_id: Joi.string(),
        type: Joi.string().valid("audio", "video", "text"),
        media_url: Joi.string().uri().allow("", null),
        author: Joi.string().allow("", null),
        duration: Joi.string().allow("", null),
        is_downloadable: Joi.boolean(),
        language: Joi.string().allow("", null),
        thumbnail: Joi.string().uri().allow("", null),
        youtubeLiveLink: Joi.string().uri().allow("", null),
        isLive: Joi.boolean(),
    })
        .prefs({ stripUnknown: true })
        .validate(payload);

export const middlewareValidateCreateMedia = (req, res, next) => {
    const { error } = validateCreateMedia(req.body);
    if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
    next();
};

export const middlewareValidateUpdateMedia = (req, res, next) => {
    const { error } = validateUpdateMedia(req.body);
    if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
    next();
};
