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
    const { page, limit: pageSize, year } = req.query;
    const hasPagination = page !== undefined || pageSize !== undefined;
    const pagination = hasPagination ? paginate(page || 1, pageSize) : null;
    const currentYear = new Date().getFullYear();
    let yearFilter = currentYear;

    if (year !== undefined) {
      if (year === "all") {
        yearFilter = null;
      } else {
        const parsedYear = Number.parseInt(year, 10);
        yearFilter = Number.isFinite(parsedYear) ? parsedYear : currentYear;
      }
    }

    let data;
    let meta = {};

    if (hasPagination) {
      const { items, total } = await EventService.getAllEventsWithCount({
        pagination,
        year: yearFilter,
      });
      data = items;
      const pageNum = Number.parseInt(page || 1, 10);
      const limitNum = pagination?.limit;
      meta = {
        totalItems: total,
        totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
        currentPage: pageNum,
        pageSize: limitNum,
      };
    } else {
      data = await EventService.getAllEvents({
        pagination,
        year: yearFilter,
      });
    }
    return sendSuccess(res, {
      message: "Events fetched successfully",
      data,
      meta,
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
