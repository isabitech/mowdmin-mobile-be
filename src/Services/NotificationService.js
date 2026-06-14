import NotificationDeviceRepository from "../repositories/NotificationDeviceRepository.js";
import NotificationDispatchLogRepository from "../repositories/NotificationDispatchLogRepository.js";
import ProfileRepository from "../repositories/ProfileRepository.js";
import { NotificationRepository } from "../repositories/NotificationRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import NotificationPushService from "./NotificationPushService.js";
import { AppError } from "../Utils/AppError.js";
import {
  DEFAULT_NOTIFICATION_DELIVERY,
  DEFAULT_NOTIFICATION_PREFERENCES,
  normalizeNotification,
  normalizeNotificationDevice,
  normalizeNotificationPreferences,
} from "../Utils/notification.js";

const serializeId = (value) => {
  if (!value) return null;

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    if (value._id) {
      return serializeId(value._id);
    }

    if (value.id) {
      return serializeId(value.id);
    }

    if (typeof value.toString === "function") {
      const serialized = value.toString();
      if (serialized && serialized !== "[object Object]") {
        return serialized;
      }
    }
  }

  return null;
};

const uniqueIds = (values = []) =>
  [...new Set(values.map((value) => serializeId(value)).filter(Boolean))];

const createPushSummary = () => ({
  attempted: 0,
  accepted: 0,
  failed: 0,
  invalidTokens: [],
  tickets: [],
  acceptedMessageRefs: [],
  failedMessageRefs: [],
  skipped: false,
});

const buildPushPayloadData = ({ type, metadata = {} }) => ({
  ...(metadata || {}),
  notificationType: type,
});

const sanitizePushSummary = (pushSummary = {}) => ({
  attempted: pushSummary.attempted || 0,
  accepted: pushSummary.accepted || 0,
  failed: pushSummary.failed || 0,
  invalidTokens: pushSummary.invalidTokens || [],
  tickets: pushSummary.tickets || [],
  skipped: Boolean(pushSummary.skipped),
});

class NotificationService {
  async createNotification(...args) {
    return this.create(...args);
  }

  async create(
    userId,
    title,
    message,
    type = "info",
    metadata = {},
    delivery = {},
  ) {
    const notification = await NotificationRepository.create({
      userId,
      title,
      message,
      type,
      metadata: metadata || {},
      delivery: {
        ...DEFAULT_NOTIFICATION_DELIVERY,
        ...delivery,
      },
    });

    return normalizeNotification(notification);
  }

  async createManyForUsers(userIds = [], payload = {}, delivery = {}) {
    const uniqueUserIds = uniqueIds(userIds);

    if (uniqueUserIds.length === 0) {
      return [];
    }

    const notifications = await NotificationRepository.createMany(
      uniqueUserIds.map((userId) => ({
        userId,
        title: payload.title,
        message: payload.message,
        type: payload.type || "info",
        metadata: payload.metadata || {},
        delivery: {
          ...DEFAULT_NOTIFICATION_DELIVERY,
          ...delivery,
        },
      })),
    );

    return notifications.map(normalizeNotification);
  }

  async getUserNotifications(userId, pagination = {}) {
    const notifications = await NotificationRepository.findAllByUserId(
      userId,
      pagination,
    );

    return notifications.map(normalizeNotification);
  }

  async markAsRead(notificationId, userId) {
    const notification = await NotificationRepository.markAsReadByUserId(
      notificationId,
      userId,
    );

    return normalizeNotification(notification);
  }

  async getUserPreferences(userId) {
    const profile = await ProfileRepository.findByUserId(userId);
    return normalizeNotificationPreferences(profile?.notificationPreferences);
  }

  async updateUserPreferences(userId, updates = {}) {
    const profile = await ProfileRepository.findByUserId(userId);
    const existingPreferences = normalizeNotificationPreferences(
      profile?.notificationPreferences,
    );
    const nextPreferences = {
      ...existingPreferences,
      ...updates,
    };

    if (!profile) {
      await ProfileRepository.create({
        userId,
        notificationPreferences: nextPreferences,
      });
      return nextPreferences;
    }

    await ProfileRepository.updateByUserId(userId, {
      notificationPreferences: nextPreferences,
    });

    return nextPreferences;
  }

  async registerDevice(userId, payload = {}) {
    const device = await NotificationDeviceRepository.upsertByToken(
      payload.token,
      {
        userId,
        platform: payload.platform,
        deviceName: payload.deviceName || null,
        appVersion: payload.appVersion || null,
        locale: payload.locale || null,
        isActive: true,
        lastSeenAt: new Date(),
      },
    );

    return normalizeNotificationDevice(device);
  }

  async unregisterDevice(userId, token) {
    const device = await NotificationDeviceRepository.deactivateByToken(
      token,
      userId,
    );

    return normalizeNotificationDevice(device);
  }

  async createByAdmin(payload = {}) {
    return this.createAdminNotification(payload);
  }

  async createAdminNotification(payload = {}) {
    return this.dispatch(payload, { throwOnEmpty: true });
  }

  async dispatch(payload = {}, { throwOnEmpty = false } = {}) {
    const deliveryPayload = {
      sendPush: true,
      createInApp: true,
      respectPreferences: true,
      ...payload,
    };
    const recipientIds = await this.resolveRecipientIds(deliveryPayload);

    if (recipientIds.length === 0) {
      if (throwOnEmpty) {
        throw new AppError("No matching users found for this notification", 404);
      }

      return {
        recipientCount: 0,
        targetUserIds: [],
        inAppRecipientCount: 0,
        pushRecipientCount: 0,
        pushDeviceCount: 0,
        createdNotificationsCount: 0,
        push: sanitizePushSummary(createPushSummary()),
      };
    }

    const preferenceMap = await this.getPreferenceMap(recipientIds);
    const dispatchStateMap = deliveryPayload.referenceKey
      ? await this.getDispatchStateMap(
          deliveryPayload.referenceKey,
          recipientIds,
        )
      : new Map();

    const inAppRecipients = deliveryPayload.createInApp
      ? recipientIds.filter((userId) =>
          this.isChannelEnabled({
            userId,
            preferenceMap,
            channel: "inApp",
            respectPreferences: deliveryPayload.respectPreferences,
            preferenceKey: deliveryPayload.preferenceKey,
          }) &&
          !this.hasDispatchState({
            dispatchStateMap,
            userId,
            channel: "inApp",
          }),
        )
      : [];

    const pushRecipients = deliveryPayload.sendPush
      ? recipientIds.filter((userId) =>
          this.isChannelEnabled({
            userId,
            preferenceMap,
            channel: "push",
            respectPreferences: deliveryPayload.respectPreferences,
            preferenceKey: deliveryPayload.preferenceKey,
          }),
          !this.hasDispatchState({
            dispatchStateMap,
            userId,
            channel: "push",
          }),
        )
      : [];

    const notifications = await this.createManyForUsers(
      inAppRecipients,
      deliveryPayload,
      {
        inAppCreated: true,
      },
    );

    if (deliveryPayload.referenceKey && inAppRecipients.length > 0) {
      await this.markDispatchState(
        deliveryPayload.referenceKey,
        inAppRecipients,
        {
          inAppCreated: true,
          lastSentAt: new Date(),
        },
      );
    }

    const devices =
      pushRecipients.length > 0
        ? await NotificationDeviceRepository.findActiveByUserIds(pushRecipients)
        : [];

    const pushMessages = devices.map((device) => ({
      to: device.token,
      title: deliveryPayload.title,
      body: deliveryPayload.message,
      sound: "default",
      data: buildPushPayloadData(deliveryPayload),
      __meta: {
        userId: serializeId(device.userId),
        token: device.token,
      },
    }));

    const pushSummary =
      pushMessages.length > 0
        ? await NotificationPushService.send(pushMessages)
        : createPushSummary();

    if (pushSummary.invalidTokens.length > 0) {
      await NotificationDeviceRepository.deactivateManyByTokens(
        pushSummary.invalidTokens,
      );
    }

    const deliveredPushUserIds = uniqueIds(
      (pushSummary.acceptedMessageRefs || []).map((entry) => entry?.userId),
    );

    if (deliveryPayload.referenceKey && deliveredPushUserIds.length > 0) {
      await this.markDispatchState(
        deliveryPayload.referenceKey,
        deliveredPushUserIds,
        {
          pushSent: true,
          lastSentAt: new Date(),
        },
      );
    }

    return {
      recipientCount: recipientIds.length,
      targetUserIds: recipientIds,
      inAppRecipientCount: inAppRecipients.length,
      pushRecipientCount: pushRecipients.length,
      pushDeviceCount: pushMessages.length,
      createdNotificationsCount: notifications.length,
      push: sanitizePushSummary(pushSummary),
      notifications:
        notifications.length > 0 && notifications.length <= 20
          ? notifications
          : undefined,
    };
  }

  async resolveRecipientIds(payload = {}) {
    if (payload.sendToAll) {
      const users = await UserRepository.findAllIds();
      return uniqueIds(users.map((user) => user?._id || user?.id));
    }

    const requestedIds = uniqueIds([
      payload.userId,
      ...(payload.userIds || []),
    ]);

    if (requestedIds.length === 0) {
      return [];
    }

    const existingUsers = await UserRepository.findExistingIds(requestedIds);
    return uniqueIds(existingUsers.map((user) => user?._id || user?.id));
  }

  async getDispatchStateMap(referenceKey, userIds = []) {
    const normalizedIds = uniqueIds(userIds);
    const map = new Map();

    if (!referenceKey || normalizedIds.length === 0) {
      return map;
    }

    const records =
      await NotificationDispatchLogRepository.findByReferenceKeyAndUserIds(
        referenceKey,
        normalizedIds,
      );

    records.forEach((record) => {
      const userId = serializeId(record?.userId);
      if (!userId) return;
      map.set(userId, {
        pushSent: Boolean(record?.pushSent),
        inAppCreated: Boolean(record?.inAppCreated),
      });
    });

    return map;
  }

  async markDispatchState(referenceKey, userIds = [], updates = {}) {
    const normalizedIds = uniqueIds(userIds);

    if (!referenceKey || normalizedIds.length === 0) {
      return [];
    }

    return NotificationDispatchLogRepository.upsertMany(
      referenceKey,
      normalizedIds,
      updates,
    );
  }

  async getPreferenceMap(userIds = []) {
    const normalizedIds = uniqueIds(userIds);
    const map = new Map(
      normalizedIds.map((userId) => [userId, DEFAULT_NOTIFICATION_PREFERENCES]),
    );

    if (normalizedIds.length === 0) {
      return map;
    }

    const profiles = await ProfileRepository.findAllByUserIds(normalizedIds);

    profiles.forEach((profile) => {
      const userId = serializeId(profile?.userId);
      if (!userId) return;
      map.set(
        userId,
        normalizeNotificationPreferences(profile?.notificationPreferences),
      );
    });

    return map;
  }

  hasDispatchState({ dispatchStateMap, userId, channel }) {
    if (!(dispatchStateMap instanceof Map)) {
      return false;
    }

    const state = dispatchStateMap.get(userId);
    if (!state) return false;

    return channel === "push"
      ? Boolean(state.pushSent)
      : Boolean(state.inAppCreated);
  }

  isChannelEnabled({
    userId,
    preferenceMap,
    channel,
    respectPreferences = true,
    preferenceKey = null,
  }) {
    if (!respectPreferences) {
      return true;
    }

    const preferences =
      preferenceMap.get(userId) || DEFAULT_NOTIFICATION_PREFERENCES;
    const channelAllowed =
      channel === "push"
        ? preferences.pushNotification
        : preferences.inAppNotification;
    const categoryAllowed = preferenceKey
      ? preferences[preferenceKey] !== false
      : true;

    return channelAllowed && categoryAllowed;
  }
}

export default new NotificationService();
