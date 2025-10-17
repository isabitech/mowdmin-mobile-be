import EventService from "../Services/EventService.js";
import { success } from "../Utils/helper.js";

class EventController {
  async create(req, res, next) {

    const data = { ...req.body };
    if (req.file) data.image = `/uploads/${req.file.filename}`;

    const event = await EventService.createEvent(data);
    const eventData = {
      ...event.toJSON(),
      image: event.image ? `${req.protocol}://${req.get("host")}${event.image}` : null,
    };

    return success(res, "Event Created Successfully", eventData);

  }

  async getAll(req, res, next) {

    const events = await EventService.getAllEvents();
    const formatted = events.map((event) => ({
      ...event.toJSON(),
      image: event.image ? `${req.protocol}://${req.get("host")}${event.image}` : null,
    }));

    return success(res, "All Events Fetched Successfully", formatted);

  }

  async getOne(req, res, next) {

    const event = await EventService.getEventById(req.params.id);
    const eventData = {
      ...event.toJSON(),
      image: event.image ? `${req.protocol}://${req.get("host")}${event.image}` : null,
    };

    return success(res, "Event Fetched Successfully", eventData);

  }

  async update(req, res, next) {

    const data = { ...req.body };
    if (req.file) data.image = `/uploads/${req.file.filename}`;

    const event = await EventService.updateEvent(req.params.id, data);
    const eventData = {
      ...event.toJSON(),
      image: event.image ? `${req.protocol}://${req.get("host")}${event.image}` : null,
    };

    return success(res, "Event Updated Successfully", eventData);

  }

  async delete(req, res, next) {
    await EventService.deleteEvent(req.params.id);
    return success(res, "Event Deleted Successfully");
  }
}

export default new EventController();
