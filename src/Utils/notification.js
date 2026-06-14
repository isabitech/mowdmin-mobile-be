export const NOTIFICATION_TYPES = [
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
  "like",
  "comment",
  "follow",
  "mention",
  "other",
];

export const NOTIFICATION_PREFERENCE_KEYS = [
  "monthlyEvents",
  "eventReminder",
];

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  emailNotification: false,
  pushNotification: true,
  inAppNotification: true,
  monthlyEvents: true,
  eventReminder: true,
};

export const DEFAULT_NOTIFICATION_DELIVERY = {
  pushSent: false,
  inAppCreated: false,
  emailSent: false,
};

const toPlainObject = (value) => {
  if (!value) return value;
  if (typeof value.toJSON === "function") {
    return value.toJSON();
  }
  if (typeof value.toObject === "function") {
    return value.toObject();
  }
  return { ...value };
};

export const normalizeNotificationPreferences = (value = {}) => {
  const raw = toPlainObject(value) || {};
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(typeof raw.emailNotification === "boolean"
      ? { emailNotification: raw.emailNotification }
      : {}),
    ...(typeof raw.pushNotification === "boolean"
      ? { pushNotification: raw.pushNotification }
      : {}),
    ...(typeof raw.inAppNotification === "boolean"
      ? { inAppNotification: raw.inAppNotification }
      : {}),
    ...(typeof raw.monthlyEvents === "boolean"
      ? { monthlyEvents: raw.monthlyEvents }
      : {}),
    ...(typeof raw.eventReminder === "boolean"
      ? { eventReminder: raw.eventReminder }
      : {}),
  };
};

export const normalizeNotification = (value) => {
  if (!value) return value;
  const raw = toPlainObject(value) || {};
  const identifier = raw._id || raw.id;

  return {
    ...raw,
    _id: identifier,
    isRead: Boolean(raw.isRead ?? raw.read ?? false),
    metadata: raw.metadata || {},
    delivery: {
      ...DEFAULT_NOTIFICATION_DELIVERY,
      ...(raw.delivery || {}),
    },
  };
};

export const normalizeNotificationDevice = (value) => {
  if (!value) return value;
  const raw = toPlainObject(value) || {};
  const identifier = raw._id || raw.id;

  return {
    ...raw,
    _id: identifier,
    isActive: raw.isActive !== false,
    lastSeenAt: raw.lastSeenAt || raw.updatedAt || raw.createdAt || null,
  };
};

export const isExpoPushToken = (token) =>
  /^(ExponentPushToken|ExpoPushToken)\[[^\]]+\]$/.test(String(token || ""));
