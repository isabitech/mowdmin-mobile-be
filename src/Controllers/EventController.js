import EventService from "../Services/EventService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreateEvent, validateUpdateEvent } from "../validators/eventValidators.js";

class EventController {
  async create(req, res, next) {
    const { error, value } = validateCreateEvent(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const data = { ...value };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const event = await EventService.createEvent(data);
    const eventData = {
      ...event.toJSON(),
      image: event.image ? `${req.protocol}://${req.get("host")}${event.image}` : null,
    };
    return sendSuccess(res, { message: "Event Created Successfully", data: eventData });
  }
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
  async getAll(req, res, next) {
    const events = await EventService.getAllEvents();
    const formatted = events.map((event) => ({
      ...event.toJSON(),
      image: event.image ? `${req.protocol}://${req.get("host")}${event.image}` : null,
    }));
    return sendSuccess(res, { message: "All Events Fetched Successfully", data: formatted });
  }
  async getOne(req, res, next) {
    const event = await EventService.getEventById(req.params.id);
    const eventData = {
      ...event.toJSON(),
      image: event.image ? `${req.protocol}://${req.get("host")}${event.image}` : null,
    };
    return sendSuccess(res, { message: "Event Fetched Successfully", data: eventData });
  }
  async update(req, res, next) {
    const { error, value } = validateUpdateEvent(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const data = { ...value };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const event = await EventService.updateEvent(req.params.id, data);
    const eventData = {
      ...event.toJSON(),
      image: event.image ? `${req.protocol}://${req.get("host")}${event.image}` : null,
    };
    return sendSuccess(res, { message: "Event Updated Successfully", data: eventData });
  }
  async delete(req, res, next) {
    await EventService.deleteEvent(req.params.id);
    return sendSuccess(res, { message: "Event Deleted Successfully", data: {} });
  }
}

export default new EventController();
