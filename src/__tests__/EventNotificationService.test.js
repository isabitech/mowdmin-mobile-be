jest.mock("../repositories/EventRepository.js", () => ({
  EventRepository: {
    findAll: jest.fn(),
    getModels: jest.fn(),
    registrationfindAll: jest.fn(),
  },
}));

jest.mock("../Services/NotificationService.js", () => ({
  __esModule: true,
  default: {
    dispatch: jest.fn(),
  },
}));

import EventNotificationService from "../Services/EventNotificationService.js";
import { EventRepository } from "../repositories/EventRepository.js";
import NotificationService from "../Services/NotificationService.js";

describe("EventNotificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    EventRepository.getModels.mockResolvedValue({
      EventRegistrationModel: {},
    });
    NotificationService.dispatch.mockResolvedValue({
      createdNotificationsCount: 1,
      pushDeviceCount: 1,
    });
  });

  it("should send a monthly digest when an event is created", async () => {
    EventRepository.findAll.mockResolvedValue([
      { id: "event-1" },
      { id: "event-2" },
    ]);

    await EventNotificationService.handleEventCreated({
      id: "event-1",
      title: "Revival Night",
      date: "2099-07-12",
      time: "17:00",
    });

    expect(NotificationService.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Events for July 2099",
        type: "event",
        sendToAll: true,
        preferenceKey: "monthlyEvents",
        referenceKey: "monthly-events:2099-07",
        metadata: expect.objectContaining({
          target: "event",
          monthKey: "2099-07",
        }),
      }),
    );
    expect(NotificationService.dispatch.mock.calls[0][0].message).toContain(
      "2 events are scheduled for July 2099",
    );
  });

  it("should send an event update notification to registered users", async () => {
    await EventNotificationService.handleEventUpdated(
      {
        id: "event-1",
        title: "Revival Night",
        date: "2099-07-12",
        time: "17:00",
        location: "Main Hall",
        registrations: [
          { userId: "user-1", status: "registered" },
          { userId: "user-2", status: "attended" },
        ],
      },
      {
        id: "event-1",
        title: "Revival Night",
        date: "2099-07-12",
        time: "18:00",
        location: "Main Hall",
      },
    );

    expect(NotificationService.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        userIds: ["user-1"],
        title: "Event updated",
        type: "event",
        referenceKey: "event-update:event-1:2099-07-12:18:00:main hall",
        metadata: expect.objectContaining({
          eventId: "event-1",
          category: "event-update",
        }),
      }),
    );
    expect(NotificationService.dispatch.mock.calls[0][0].message).toContain(
      "new start time",
    );
  });

  it("should send a registration confirmation notification", async () => {
    await EventNotificationService.handleRegistrationCreated({
      id: "registration-1",
      userId: "user-1",
      eventId: {
        id: "event-1",
        title: "Revival Night",
        date: "2099-07-12",
        time: "17:00",
      },
    });

    expect(NotificationService.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        title: "You are registered",
        type: "event",
        referenceKey: "event-registration:registration-1",
        metadata: expect.objectContaining({
          eventId: "event-1",
          category: "registration-confirmation",
        }),
      }),
    );
    expect(NotificationService.dispatch.mock.calls[0][0].message).toContain(
      "You are registered for Revival Night",
    );
  });

  it("should send a 24 hour reminder for due events", async () => {
    EventRepository.findAll
      .mockResolvedValueOnce([
        {
          id: "event-1",
          title: "Revival Night",
          date: "2099-07-12",
          time: "17:00",
          registrations: [{ userId: "user-1", status: "registered" }],
        },
      ])
      .mockResolvedValueOnce([]);

    const summary = await EventNotificationService.processPendingReminders({
      now: new Date("2099-07-11T15:58:00.000Z"),
      windowMinutes: 5,
    });

    expect(NotificationService.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        userIds: ["user-1"],
        title: "Reminder: Revival Night",
        type: "reminder",
        preferenceKey: "eventReminder",
        referenceKey: "event-reminder:24h:event-1",
      }),
    );
    expect(summary.reminders24h.matchedEventCount).toBe(1);
    expect(summary.reminders2h.matchedEventCount).toBe(0);
  });
});
