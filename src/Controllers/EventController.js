import EventService from "../Services/EventService.js";
import { sendSuccess, sendError } from "../core/response.js";

class EventController {
  async create(req, res, next) {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const event = await EventService.createEvent(data);
    const eventJson = event.toJSON ? event.toJSON() : event;
    const eventData = {
      ...eventJson,
      image: event.image ? `${process.env.BASE_URL}${event.image}` : null,
    };
    return sendSuccess(res, { message: "Event Created Successfully", data: eventData, statusCode: 201 });
  }




  async update(req, res, next) {
    let updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    const event = await EventService.updateEvent(req.params.id, updateData);
    if (!event) {
      return sendError(res, { message: "Event not found", statusCode: 404 });
    }
    const eventJson = event.toJSON ? event.toJSON() : event;
    const eventData = {
      ...eventJson,
      image: event.image ? `${process.env.BASE_URL}${event.image}` : null,
    };
    return sendSuccess(res, { message: "Event Updated Successfully", data: eventData });
  }
  async delete(req, res, next) {
    await EventService.deleteEvent(req.params.id);
    return sendSuccess(res, { message: "Event Deleted Successfully", data: {} });
  }
  async getAll(req, res, next) {
    const events = await EventService.getAllEvents();
    return sendSuccess(res, { message: "Events fetched successfully", data: events });
  }
  async getOne(req, res, next) {
    const event = await EventService.getEventById(req.params.id);
    if (!event) {
      return sendError(res, { message: "Event not found", statusCode: 404 });
    }
    return sendSuccess(res, { message: "Event fetched successfully", data: event });
  }
}

export default new EventController();
