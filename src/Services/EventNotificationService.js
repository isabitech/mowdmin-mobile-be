import { Op } from "sequelize";
import { logger } from "../core/logger.js";
import { EventRepository } from "../repositories/EventRepository.js";
import NotificationService from "./NotificationService.js";

const EVENT_NOTIFICATION_TIME_ZONE =
  process.env.EVENT_NOTIFICATION_TIMEZONE ||
  process.env.EVENT_TIMEZONE ||
  "Africa/Lagos";
const DEFAULT_REMINDER_WINDOW_MINUTES = Number.parseInt(
  process.env.EVENT_REMINDER_WINDOW_MINUTES || "5",
  10,
);

const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";

const serializeId = (value) => {
  if (!value) return null;

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    if (value._id) return serializeId(value._id);
    if (value.id) return serializeId(value.id);
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

const padNumber = (value) => String(value).padStart(2, "0");

const getDateParts = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const [year, month, day] = date.toISOString().slice(0, 10).split("-");
  return {
    year: Number.parseInt(year, 10),
    month: Number.parseInt(month, 10),
    day: Number.parseInt(day, 10),
  };
};

const parseTimeString = (timeValue) => {
  const value = String(timeValue || "").trim();
  if (!value) return null;

  const militaryMatch = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (militaryMatch) {
    return {
      hour: Number.parseInt(militaryMatch[1], 10),
      minute: Number.parseInt(militaryMatch[2], 10),
    };
  }

  const amPmMatch = value.match(
    /^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AP]M)$/i,
  );
  if (!amPmMatch) {
    return null;
  }

  let hour = Number.parseInt(amPmMatch[1], 10);
  const minute = Number.parseInt(amPmMatch[2], 10);
  const meridian = amPmMatch[3].toUpperCase();

  if (meridian === "AM" && hour === 12) {
    hour = 0;
  } else if (meridian === "PM" && hour !== 12) {
    hour += 12;
  }

  return { hour, minute };
};

const getTimeZoneOffsetMinutes = (
  timeZone,
  date = new Date(),
) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter
    .formatToParts(date)
    .filter((part) => part.type !== "literal")
    .reduce((accumulator, part) => {
      accumulator[part.type] = part.value;
      return accumulator;
    }, {});
  const asUtc = Date.UTC(
    Number.parseInt(parts.year, 10),
    Number.parseInt(parts.month, 10) - 1,
    Number.parseInt(parts.day, 10),
    Number.parseInt(parts.hour, 10),
    Number.parseInt(parts.minute, 10),
    Number.parseInt(parts.second, 10),
  );

  return (asUtc - date.getTime()) / 60000;
};

const combineDateAndTimeInTimeZone = (
  dateValue,
  timeValue,
  timeZone = EVENT_NOTIFICATION_TIME_ZONE,
) => {
  const dateParts = getDateParts(dateValue);
  const timeParts = parseTimeString(timeValue);

  if (!dateParts || !timeParts) {
    return null;
  }

  const utcGuess = new Date(
    Date.UTC(
      dateParts.year,
      dateParts.month - 1,
      dateParts.day,
      timeParts.hour,
      timeParts.minute,
      0,
      0,
    ),
  );
  const firstOffset = getTimeZoneOffsetMinutes(timeZone, utcGuess);
  const firstPass = new Date(utcGuess.getTime() - firstOffset * 60 * 1000);
  const finalOffset = getTimeZoneOffsetMinutes(timeZone, firstPass);

  return new Date(utcGuess.getTime() - finalOffset * 60 * 1000);
};

const getMonthKeyFromDate = (dateValue) => {
  const parts = getDateParts(dateValue);
  if (!parts) return null;
  return `${parts.year}-${padNumber(parts.month)}`;
};

const getMonthRangeFromDate = (dateValue) => {
  const parts = getDateParts(dateValue);
  if (!parts) return null;

  return {
    start: new Date(Date.UTC(parts.year, parts.month - 1, 1)),
    end: new Date(Date.UTC(parts.year, parts.month, 1)),
  };
};

const formatMonthLabel = (dateValue) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_NOTIFICATION_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(new Date(dateValue));

const formatEventDateTime = (eventStart) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_NOTIFICATION_TIME_ZONE,
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(eventStart);

const formatEventTime = (eventStart) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_NOTIFICATION_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(eventStart);

const startOfUtcDay = (value) => {
  const date = new Date(value);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

const addMinutes = (value, minutes) =>
  new Date(value.getTime() + minutes * 60 * 1000);

const addHours = (value, hours) =>
  new Date(value.getTime() + hours * 60 * 60 * 1000);

const addDays = (value, days) =>
  new Date(value.getTime() + days * 24 * 60 * 60 * 1000);

const isWithinRange = (date, start, end) =>
  date.getTime() >= start.getTime() && date.getTime() < end.getTime();

const buildMonthlyDigestMessage = (count, monthLabel) => {
  const noun = count === 1 ? "event is" : "events are";
  return `${count} ${noun} scheduled for ${monthLabel}. Tap to view the calendar.`;
};

const buildUpdateMessage = (changedFields = [], eventTitle = "This event") => {
  if (changedFields.length === 1 && changedFields[0] === "time") {
    return `${eventTitle} has a new start time. Tap to review the update.`;
  }

  if (changedFields.length === 1 && changedFields[0] === "date") {
    return `${eventTitle} has a new date. Tap to review the update.`;
  }

  if (changedFields.length === 1 && changedFields[0] === "location") {
    return `${eventTitle} has a new location. Tap to review the update.`;
  }

  return `${eventTitle} has been updated. Tap to review the update.`;
};

const normalizeDateOnly = (dateValue) => {
  const parts = getDateParts(dateValue);
  if (!parts) return null;
  return `${parts.year}-${padNumber(parts.month)}-${padNumber(parts.day)}`;
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const getChangedFields = (beforeEvent, afterEvent) => {
  const changes = [];

  if (normalizeDateOnly(beforeEvent?.date) !== normalizeDateOnly(afterEvent?.date)) {
    changes.push("date");
  }

  if (String(beforeEvent?.time || "").trim() !== String(afterEvent?.time || "").trim()) {
    changes.push("time");
  }

  if (normalizeText(beforeEvent?.location) !== normalizeText(afterEvent?.location)) {
    changes.push("location");
  }

  return changes;
};

const buildDateRangeWhere = (start, end) =>
  getIsMongo()
    ? {
        date: {
          $gte: start,
          $lt: end,
        },
      }
    : {
        date: {
          [Op.gte]: start,
          [Op.lt]: end,
        },
      };

class EventNotificationService {
  async handleEventCreated(event) {
    const eventId = serializeId(event?._id || event?.id);
    const eventStart = combineDateAndTimeInTimeZone(event?.date, event?.time);

    if (!eventId || !eventStart || eventStart.getTime() <= Date.now()) {
      return null;
    }

    const monthRange = getMonthRangeFromDate(event.date);
    const monthKey = getMonthKeyFromDate(event.date);

    if (!monthRange || !monthKey) {
      return null;
    }

    const monthEvents = await this.getEventsInDateRange(
      monthRange.start,
      monthRange.end,
    );
    const monthLabel = formatMonthLabel(event.date);
    const eventCount = monthEvents.length;

    return NotificationService.dispatch({
      title: `Events for ${monthLabel}`,
      message: buildMonthlyDigestMessage(eventCount, monthLabel),
      type: "event",
      sendToAll: true,
      sendPush: true,
      createInApp: true,
      respectPreferences: true,
      preferenceKey: "monthlyEvents",
      referenceKey: `monthly-events:${monthKey}`,
      metadata: {
        target: "event",
        monthKey,
        category: "monthly-events",
      },
    });
  }

  async handleRegistrationCreated(registration) {
    const userId = serializeId(registration?.userId);
    const event = registration?.eventId || registration?.event;
    const eventId = serializeId(event?._id || event?.id || registration?.eventId);
    const eventStart = combineDateAndTimeInTimeZone(event?.date, event?.time);

    if (!userId || !eventId || !eventStart) {
      return null;
    }

    const registrationId = serializeId(registration?._id || registration?.id);
    const monthKey = getMonthKeyFromDate(event?.date);
    const referenceKey =
      registrationId ||
      `event-registration:${eventId}:${userId}:${normalizeDateOnly(event?.date)}`;

    return NotificationService.dispatch({
      userId,
      title: "You are registered",
      message: `You are registered for ${event?.title || "this event"} on ${formatEventDateTime(
        eventStart,
      )}.`,
      type: "event",
      sendPush: true,
      createInApp: true,
      respectPreferences: true,
      referenceKey: `event-registration:${referenceKey}`,
      metadata: {
        target: "event",
        eventId,
        monthKey,
        category: "registration-confirmation",
      },
    });
  }

  async handleEventUpdated(beforeEvent, afterEvent) {
    const eventId = serializeId(afterEvent?._id || afterEvent?.id || beforeEvent?._id || beforeEvent?.id);
    if (!eventId) {
      return null;
    }

    const changedFields = getChangedFields(beforeEvent, afterEvent);
    if (changedFields.length === 0) {
      return null;
    }

    const registrationSource =
      Array.isArray(afterEvent?.registrations) && afterEvent.registrations.length > 0
        ? afterEvent
        : beforeEvent || afterEvent;
    const registeredUserIds = await this.getRegisteredUserIds(registrationSource);
    if (registeredUserIds.length === 0) {
      return null;
    }

    const monthKey = getMonthKeyFromDate(afterEvent?.date || beforeEvent?.date);
    const referenceKey = [
      "event-update",
      eventId,
      normalizeDateOnly(afterEvent?.date),
      String(afterEvent?.time || "").trim(),
      normalizeText(afterEvent?.location),
    ].join(":");

    return NotificationService.dispatch({
      userIds: registeredUserIds,
      title: "Event updated",
      message: buildUpdateMessage(changedFields, afterEvent?.title || beforeEvent?.title),
      type: "event",
      sendPush: true,
      createInApp: true,
      respectPreferences: true,
      referenceKey,
      metadata: {
        target: "event",
        eventId,
        monthKey,
        category: "event-update",
      },
    });
  }

  async processPendingReminders({
    now = new Date(),
    windowMinutes = DEFAULT_REMINDER_WINDOW_MINUTES,
  } = {}) {
    const [twentyFourHourSummary, twoHourSummary] = await Promise.all([
      this.processReminderTrigger({
        hoursBefore: 24,
        now,
        windowMinutes,
      }),
      this.processReminderTrigger({
        hoursBefore: 2,
        now,
        windowMinutes,
      }),
    ]);

    return {
      processedAt: now.toISOString(),
      windowMinutes,
      reminders24h: twentyFourHourSummary,
      reminders2h: twoHourSummary,
      totalNotifications:
        twentyFourHourSummary.createdNotificationsCount +
        twoHourSummary.createdNotificationsCount,
    };
  }

  async processReminderTrigger({ hoursBefore, now, windowMinutes }) {
    const dueStart = addHours(now, hoursBefore);
    const dueEnd = addMinutes(dueStart, windowMinutes);
    const candidateStart = startOfUtcDay(dueStart);
    const candidateEnd = startOfUtcDay(addDays(dueEnd, 1));
    const events = await this.getEventsInDateRange(candidateStart, candidateEnd);
    const matchedEvents = [];
    let createdNotificationsCount = 0;
    let pushDeviceCount = 0;

    for (const event of events) {
      const eventStart = combineDateAndTimeInTimeZone(event?.date, event?.time);
      if (!eventStart || !isWithinRange(eventStart, dueStart, dueEnd)) {
        continue;
      }

      const userIds = await this.getRegisteredUserIds(event);
      if (userIds.length === 0) {
        continue;
      }

      const eventId = serializeId(event?._id || event?.id);
      const monthKey = getMonthKeyFromDate(event?.date);
      const summary = await NotificationService.dispatch({
        userIds,
        title: `Reminder: ${event?.title || "Event"}`,
        message:
          hoursBefore === 24
            ? `${event?.title || "This event"} starts tomorrow at ${formatEventTime(
                eventStart,
              )}.`
            : `${event?.title || "This event"} starts in 2 hours.`,
        type: "reminder",
        sendPush: true,
        createInApp: true,
        respectPreferences: true,
        preferenceKey: "eventReminder",
        referenceKey: `event-reminder:${hoursBefore}h:${eventId}`,
        metadata: {
          target: "event",
          eventId,
          monthKey,
          category: `event-reminder-${hoursBefore}h`,
        },
      });

      createdNotificationsCount += summary.createdNotificationsCount || 0;
      pushDeviceCount += summary.pushDeviceCount || 0;
      matchedEvents.push(eventId);
    }

    return {
      hoursBefore,
      dueWindowStart: dueStart.toISOString(),
      dueWindowEnd: dueEnd.toISOString(),
      matchedEventIds: matchedEvents,
      matchedEventCount: matchedEvents.length,
      createdNotificationsCount,
      pushDeviceCount,
    };
  }

  async getEventsInDateRange(start, end) {
    const { EventRegistrationModel } = await EventRepository.getModels();

    return EventRepository.findAll({
      where: buildDateRangeWhere(start, end),
      include: getIsMongo()
        ? undefined
        : [
            {
              model: EventRegistrationModel,
              as: "registrations",
            },
          ],
      order: [["date", "ASC"]],
    });
  }

  async getRegisteredUserIds(event) {
    const registrations = Array.isArray(event?.registrations)
      ? event.registrations
      : await EventRepository.registrationfindAll({
          eventId: serializeId(event?._id || event?.id),
        });

    return uniqueIds(
      (registrations || [])
        .filter(
          (registration) =>
            !registration?.status || registration.status === "registered",
        )
        .map((registration) => registration?.userId),
    );
  }

  logFailure(message, error, meta = {}) {
    logger.error(message, {
      message: error?.message,
      stack: error?.stack,
      ...meta,
    });
  }
}

export default new EventNotificationService();
