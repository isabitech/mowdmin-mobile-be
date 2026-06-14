// MUST BE AT TOP
jest.mock("express-validator", () => {
  const middleware = (req, res, next) => next();
  const chain = () =>
    new Proxy(middleware, {
      get: (_target, prop) => {
        if (prop === "then") return undefined;
        return chain;
      },
    });
  return {
    body: chain,
    param: chain,
    query: chain,
    validationResult: () => ({
      isEmpty: () => true,
      array: () => [],
    }),
  };
});

jest.mock("nodemailer", () => ({
  createTransport: () => ({
    sendMail: () => Promise.resolve(true),
  }),
}));

import express from "express";
import request from "supertest";
import notificationRoutes from "../Routes/NotificationRoute.js";
import NotificationService from "../Services/NotificationService.js";
import {
  protectAdmin,
  protectUser,
} from "../middleware/authMiddleware.js";

jest.mock("../Services/NotificationService.js");
jest.mock("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/api/v1/notifications", notificationRoutes);
app.use((err, _req, res, _next) => {
  res
    .status(err.statusCode || 500)
    .json({ status: "error", message: err.message });
});

const validUserId = "6850f12ab4c0b7db72df9012";
const validNotificationId = "6850f12ab4c0b7db72df9013";
const validToken = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]";

describe("Notification Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    protectUser.mockImplementation((req, _res, next) => {
      req.user = { id: validUserId, isAdmin: true };
      next();
    });
    protectAdmin.mockImplementation((_req, _res, next) => next());
  });

  it("should fetch user notifications successfully", async () => {
    NotificationService.getUserNotifications.mockResolvedValue([]);

    const response = await request(app).get("/api/v1/notifications");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Notifications fetched successfully");
  });

  it("should mark a notification as read successfully", async () => {
    NotificationService.markAsRead.mockResolvedValue({
      _id: validNotificationId,
      isRead: true,
    });

    const response = await request(app).put(
      `/api/v1/notifications/${validNotificationId}/read`,
    );

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Notification marked as read");
  });

  it("should fetch notification preferences successfully", async () => {
    NotificationService.getUserPreferences.mockResolvedValue({
      emailNotification: false,
      pushNotification: true,
      inAppNotification: true,
      monthlyEvents: true,
      eventReminder: true,
    });

    const response = await request(app).get(
      "/api/v1/notifications/preferences",
    );

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe(
      "Notification preferences fetched successfully",
    );
  });

  it("should update notification preferences successfully", async () => {
    NotificationService.updateUserPreferences.mockResolvedValue({
      emailNotification: false,
      pushNotification: true,
      inAppNotification: true,
      monthlyEvents: false,
      eventReminder: true,
    });

    const response = await request(app)
      .put("/api/v1/notifications/preferences")
      .send({ monthlyEvents: false });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe(
      "Notification preferences updated successfully",
    );
  });

  it("should register a device token successfully", async () => {
    NotificationService.registerDevice.mockResolvedValue({
      _id: "device_123",
      token: validToken,
      platform: "android",
      isActive: true,
    });

    const response = await request(app)
      .post("/api/v1/notifications/devices/register")
      .send({
        token: validToken,
        platform: "android",
        deviceName: "Pixel 8",
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe(
      "Device token registered successfully",
    );
  });

  it("should unregister a device token successfully", async () => {
    NotificationService.unregisterDevice.mockResolvedValue({});

    const response = await request(app)
      .post("/api/v1/notifications/devices/unregister")
      .send({
        token: validToken,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe(
      "Device token unregistered successfully",
    );
  });

  it("should validate device token format on registration", async () => {
    const response = await request(app)
      .post("/api/v1/notifications/devices/register")
      .send({
        token: "bad-token",
        platform: "android",
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Invalid Expo push token");
  });

  it("should create an admin notification successfully", async () => {
    NotificationService.createByAdmin.mockResolvedValue({
      recipientCount: 1,
      createdNotificationsCount: 1,
      pushDeviceCount: 1,
    });

    const response = await request(app)
      .post("/api/v1/notifications/create")
      .send({
        title: "Events for July 2026",
        message: "5 events are scheduled for July 2026. Tap to view the calendar.",
        type: "event",
        sendToAll: true,
        metadata: {
          target: "event",
          monthKey: "2026-07",
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Notification created successfully");
  });
});
