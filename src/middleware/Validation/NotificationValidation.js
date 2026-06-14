import { body } from "express-validator";
import Joi from "joi";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_PREFERENCE_KEYS,
  NOTIFICATION_TYPES,
  isExpoPushToken,
} from "../../Utils/notification.js";

const notificationTypeValues = [
  "event",
  "reminder",
  "info",
  "donation",
  "order",
  "group",
  "membership",
  "alert",
  "transaction",
  "system",
];

export const createNotificationValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("message").notEmpty().withMessage("Message is required"),
  body("type")
    .optional()
    .isIn(notificationTypeValues)
    .withMessage("Invalid type"),
];

const notificationBaseSchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  message: Joi.string().min(1).required(),
  type: Joi.string()
    .valid(...NOTIFICATION_TYPES)
    .default("info"),
  metadata: Joi.object().unknown(true).allow(null).default({}),
});

const validateExpoPushToken = (value, helpers) => {
  if (!isExpoPushToken(value)) {
    return helpers.message("Invalid Expo push token");
  }

  return value;
};

export const validateCreateNotification = (payload) =>
  notificationBaseSchema
    .keys({
      userId: Joi.string().trim(),
      userIds: Joi.array().items(Joi.string().trim()).min(1),
      sendToAll: Joi.boolean().default(false),
      sendPush: Joi.boolean().default(true),
      createInApp: Joi.boolean().default(true),
      respectPreferences: Joi.boolean().default(true),
      preferenceKey: Joi.string()
        .valid(...NOTIFICATION_PREFERENCE_KEYS)
        .allow(null),
    })
    .custom((value, helpers) => {
      const hasSingleUser = Boolean(value.userId);
      const hasManyUsers =
        Array.isArray(value.userIds) && value.userIds.length > 0;

      if (!value.sendToAll && !hasSingleUser && !hasManyUsers) {
        return helpers.message(
          "Provide either sendToAll, userId, or userIds",
        );
      }

      if (value.sendToAll && (hasSingleUser || hasManyUsers)) {
        return helpers.message(
          "Choose either sendToAll or specific users, not both",
        );
      }

      return value;
    })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateNotificationPreferencesUpdate = (payload) =>
  Joi.object({
    emailNotification: Joi.boolean(),
    pushNotification: Joi.boolean(),
    inAppNotification: Joi.boolean(),
    monthlyEvents: Joi.boolean(),
    eventReminder: Joi.boolean(),
  })
    .min(1)
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateNotificationDeviceRegistration = (payload) =>
  Joi.object({
    token: Joi.string().trim().required().custom(validateExpoPushToken),
    platform: Joi.string().valid("android", "ios", "web").required(),
    deviceName: Joi.string().max(255).allow("", null),
    appVersion: Joi.string().max(100).allow("", null),
    locale: Joi.string().max(32).allow("", null),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

export const validateNotificationDeviceUnregistration = (payload) =>
  Joi.object({
    token: Joi.string().trim().required().custom(validateExpoPushToken),
  })
    .prefs({ stripUnknown: true })
    .validate(payload);

const validateWithSchema = (validator) => (req, res, next) => {
  const { error, value } = validator(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  req.body = value;
  return next();
};

export const middlewareValidateCreateNotification = validateWithSchema(
  validateCreateNotification,
);

export const middlewareValidateNotificationPreferencesUpdate =
  validateWithSchema(validateNotificationPreferencesUpdate);

export const middlewareValidateNotificationDeviceRegistration =
  validateWithSchema(validateNotificationDeviceRegistration);

export const middlewareValidateNotificationDeviceUnregistration =
  validateWithSchema(validateNotificationDeviceUnregistration);

export const defaultNotificationPreferences =
  DEFAULT_NOTIFICATION_PREFERENCES;
