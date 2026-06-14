import { logger } from "../core/logger.js";
import { isExpoPushToken } from "../Utils/notification.js";

const EXPO_PUSH_URL =
  process.env.EXPO_PUSH_URL || "https://exp.host/--/api/v2/push/send";
const MAX_EXPO_MESSAGES_PER_REQUEST = 100;

const chunk = (items, size) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const getFetch = async () => globalThis.fetch || (await import("node-fetch")).default;

class NotificationPushService {
  async send(messages = []) {
    const enabled = String(process.env.EXPO_PUSH_ENABLED || "true").toLowerCase();

    if (enabled === "false") {
      return {
        attempted: 0,
        accepted: 0,
        failed: 0,
        invalidTokens: [],
        tickets: [],
        acceptedMessageRefs: [],
        failedMessageRefs: [],
        skipped: true,
      };
    }

    const validMessages = messages.filter((message) =>
      isExpoPushToken(message?.to),
    );

    if (validMessages.length === 0) {
      return {
        attempted: 0,
        accepted: 0,
        failed: 0,
        invalidTokens: [],
        tickets: [],
        acceptedMessageRefs: [],
        failedMessageRefs: [],
        skipped: false,
      };
    }

    const fetch = await getFetch();
    const summary = {
      attempted: validMessages.length,
      accepted: 0,
      failed: 0,
      invalidTokens: [],
      tickets: [],
      acceptedMessageRefs: [],
      failedMessageRefs: [],
      skipped: false,
    };

    for (const messageChunk of chunk(
      validMessages,
      MAX_EXPO_MESSAGES_PER_REQUEST,
    )) {
      try {
        const requestChunk = messageChunk.map(({ __meta, ...pushPayload }) => pushPayload);
        const response = await fetch(EXPO_PUSH_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestChunk),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          summary.failed += messageChunk.length;
          summary.failedMessageRefs.push(
            ...messageChunk
              .map((message) => message.__meta)
              .filter(Boolean),
          );
          logger.error("Expo push request failed", {
            status: response.status,
            body: payload,
          });
          continue;
        }

        const tickets = Array.isArray(payload?.data) ? payload.data : [];
        summary.tickets.push(...tickets);

        tickets.forEach((ticket, index) => {
          const messageRef = messageChunk[index]?.__meta;
          if (ticket?.status === "ok") {
            summary.accepted += 1;
            if (messageRef) {
              summary.acceptedMessageRefs.push(messageRef);
            }
            return;
          }

          summary.failed += 1;
          if (messageRef) {
            summary.failedMessageRefs.push(messageRef);
          }

          if (ticket?.details?.error === "DeviceNotRegistered") {
            const token = messageChunk[index]?.to;
            if (token) {
              summary.invalidTokens.push(token);
            }
          }
        });
      } catch (error) {
        summary.failed += messageChunk.length;
        summary.failedMessageRefs.push(
          ...messageChunk.map((message) => message.__meta).filter(Boolean),
        );
        logger.error("Expo push delivery failed", {
          message: error.message,
          attempted: messageChunk.length,
        });
      }
    }

    return summary;
  }
}

export default new NotificationPushService();
