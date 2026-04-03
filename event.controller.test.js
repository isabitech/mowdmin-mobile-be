const eventController = require("../../../src/controllers/event.controller");
const eventService = require("../../../src/services/event.service");

jest.mock("../../../src/services/event.service");

describe("EventController Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      file: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe("createEvent", () => {
    it("should create a new event and return 201", async () => {
      const eventBody = {
        title: "Sunday Service",
        date: "2025-03-15",
        time: "10:00",
        location: "Main Hall",
        type: "Crusade",
      };
      req.body = eventBody;

      const createdEvent = { _id: "event_001", ...eventBody };
      eventService.createEvent.mockResolvedValue(createdEvent);

      await eventController.createEvent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Event Created Successfully",
        data: createdEvent,
      });
    });
  });

  describe("getAllEvents", () => {
    it("should fetch list of all events", async () => {
      const mockEvents = [{ title: "Event 1" }, { title: "Event 2" }];
      eventService.getAllEvents.mockResolvedValue(mockEvents);

      await eventController.getAllEvents(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Events Fetched Successfully",
        data: mockEvents,
      });
    });
  });

  describe("deleteEvent", () => {
    it("should delete an event and return success", async () => {
      req.params.id = "event_001";
      eventService.deleteEvent.mockResolvedValue(true);

      await eventController.deleteEvent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toContainEntries([
        ["status", "success"],
        ["message", "Event Deleted Successfully"],
      ]);
    });
  });
});
