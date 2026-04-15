import EventService from "../Services/EventService.js";
import CloudinaryService from "../Services/CloudinaryService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { paginate } from "../Utils/helper.js";

class EventController {
  async create(req, res, next) {
    const data = { ...req.body };
    if (req.file) {
      const { url } = await CloudinaryService.upload(req.file.buffer, {
        folder: "mowdmin/events",
      });
      data.image = url;
    }
    const event = await EventService.createEvent(data);
    return sendSuccess(res, {
      message: "Event Created Successfully",
      data: event,
      statusCode: 201,
    });
  }

  async update(req, res, next) {
    let updateData = { ...req.body };
    if (req.file) {
      // Delete old event image from Cloudinary
      const existing = await EventService.getEventById(req.params.id);
      if (existing?.image) {
        await CloudinaryService.deleteIfCloudinary(existing.image);
      }
      const { url } = await CloudinaryService.upload(req.file.buffer, {
        folder: "mowdmin/events",
      });
      updateData.image = url;
    }
    const event = await EventService.updateEvent(req.params.id, updateData);
    if (!event) {
      return sendError(res, { message: "Resource not found", statusCode: 404 });
    }
    return sendSuccess(res, {
      message: "Event Updated Successfully",
      data: event,
    });
  }
  async delete(req, res, next) {
    // Delete event image from Cloudinary before removing the event
    const event = await EventService.getEventById(req.params.id);
    if (event?.image) {
      await CloudinaryService.deleteIfCloudinary(event.image);
    }
    await EventService.deleteEvent(req.params.id);
    return sendSuccess(res, {
      message: "Event Deleted Successfully",
      data: {},
    });
  }
  async getAll(req, res, next) {
    const { page, limit: pageSize, includePast } = req.query;
    const pagination = paginate(page || 1, pageSize);
    
    // Check if user wants to include past events (query param: includePast=true)
    const options = {
      includePastEvents: includePast === 'true'
    };
    
    const events = await EventService.getAllEvents(pagination, options);
    return sendSuccess(res, {
      message: "Events fetched successfully",
      data: events,
    });
  }
  
  async getAllAdmin(req, res, next) {
    // Admin-only endpoint to get all events including past ones
    const { page, limit: pageSize } = req.query;
    const pagination = paginate(page || 1, pageSize);
    const events = await EventService.getAllEventsAdmin(pagination);
    return sendSuccess(res, {
      message: "All events fetched successfully (including past)",
      data: events,
    });
  }
  
  async cleanupPastEvents(req, res, next) {
    // Admin-only endpoint to cleanup past events
    const result = await EventService.cleanupPastEvents();
    return sendSuccess(res, {
      message: `Cleanup completed. Deleted ${result.deletedCount} past events`,
      data: result,
    });
  }
  async getOne(req, res, next) {
    const event = await EventService.getEventById(req.params.id);
    if (!event) {
      return sendError(res, { message: "Resource not found", statusCode: 404 });
    }
    return sendSuccess(res, {
      message: "Event fetched successfully",
      data: event,
    });
  }
}

export default new EventController();
