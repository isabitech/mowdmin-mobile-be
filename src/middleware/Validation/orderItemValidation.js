import Joi from "joi";

export const validateCreateOrderItem = (payload) =>
    Joi.object({
        orderId: Joi.string().required(),
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        unit_price: Joi.number().min(0),
        subtotal: Joi.number().min(0),
    })
        .prefs({ stripUnknown: true })
        .validate(payload);

export const validateUpdateOrderItem = (payload) =>
    Joi.object({
        quantity: Joi.number().integer().min(1),
        unit_price: Joi.number().min(0),
        subtotal: Joi.number().min(0),
    })
        .prefs({ stripUnknown: true })
        .validate(payload);

export const middlewareValidateCreateOrderItem = (req, res, next) => {
    const { error } = validateCreateOrderItem(req.body);
    if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
    next();
};

export const middlewareValidateUpdateOrderItem = (req, res, next) => {
    const { error } = validateUpdateOrderItem(req.body);
    if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
    next();
};
