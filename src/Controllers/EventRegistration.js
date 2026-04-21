import EventRegistrationService from "../Services/EventRegistration.js";
import { sendSuccess, sendError } from "../core/response.js";
import { paginate } from "../Utils/helper.js";

const normalizeId = (value) => {
  if (!value) return null;
  if (typeof value === "object") {
    return value._id || value.id || value;
  }
  return value;
};

const isOwnerOrAdmin = (registration, user) => {
  if (!registration || !user) return false;
  if (user.isAdmin) return true;
  const ownerId = normalizeId(registration.userId);
  const userId = normalizeId(user.id || user._id);
  if (!ownerId || !userId) return false;
  return ownerId.toString() === userId.toString();
};

class EventRegistrationController {
  static async create(req, res) {
    const { eventId } = req.body;
    const userId = req.user.id;
    const data = { userId, eventId };
    const registration = await EventRegistrationService.createEventReg(data);

    const eventTitle = registration.eventId?.title || "event";
    return sendSuccess(res, {
      message: `Successfully registered for ${eventTitle}`,
      data: registration,
    });
  }

  static async GetAll(req, res) {
    const { page, limit: pageSize } = req.query;
    const hasPagination = page !== undefined || pageSize !== undefined;
    const pagination = hasPagination ? paginate(page || 1, pageSize) : null;

    let data;
    let meta = {};

    if (hasPagination) {
      const { items, total } =
        await EventRegistrationService.getAllRegWithCount(pagination);
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
      data = await EventRegistrationService.getAllReg();
    }
    return sendSuccess(res, {
      message: "All event registrations fetched successfully",
      data,
      meta,
    });
  }
  static async GetAllByEventId(req, res) {
    const { eventId } = req.params; // use params for IDs in route
    const registrations = await EventRegistrationService.getByEventId(eventId);
    return sendSuccess(res, {
      message: "Registrations fetched successfully",
      data: registrations,
    });
  }
  static async GetById(req, res) {
    const { id } = req.params;
    const registration = await EventRegistrationService.getRegById(id);
    if (!registration) {
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    }
    if (!isOwnerOrAdmin(registration, req.user)) {
      return sendError(res, {
        message: "Forbidden",
        statusCode: 403,
      });
    }
    return sendSuccess(res, {
      message: "Registration fetched successfully",
      data: registration,
    });
  }
  static async Update(req, res) {
    const { eventId, ticketCode, status } = req.body;
    const { id } = req.params;
    // Strip userId from body to prevent hijacking
    const data = { eventId, ticketCode, status };
    const registration = await EventRegistrationService.getRegById(id);
    if (!registration) {
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    }
    if (!isOwnerOrAdmin(registration, req.user)) {
      return sendError(res, {
        message: "Forbidden",
        statusCode: 403,
      });
    }
    const updated = await EventRegistrationService.updateEventReg(id, data);
    return sendSuccess(res, {
      message: "Registration updated successfully",
      data: updated,
    });
  }
  static async Delete(req, res) {
    const { id } = req.params;
    const registration = await EventRegistrationService.getRegById(id);
    if (!registration) {
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    }
    if (!isOwnerOrAdmin(registration, req.user)) {
      return sendError(res, {
        message: "Forbidden",
        statusCode: 403,
      });
    }
    await EventRegistrationService.deleteEventReg(id);
    return sendSuccess(res, {
      message: "Registration deleted successfully",
      data: {},
    });
  }
  static async GetAllByUser(req, res) {
    const userId = req.user.id;
    const registrations = await EventRegistrationService.getByUserId(userId);
    return sendSuccess(res, {
      message: "User registrations fetched successfully",
      data: registrations,
    });
  }

  static async Unregister(req, res) {
    const { eventId } = req.params;
    const userId = req.user.id;
    const registration = await EventRegistrationService.unregister(
      eventId,
      userId,
    );
    if (!registration) {
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    }

    const eventTitle = registration.eventId?.title || "event";
    return sendSuccess(res, {
      message: `Successfully unregistered from ${eventTitle}`,
      data: {
        eventId:
          registration.eventId?._id || registration.eventId?.id || eventId,
      },
    });
  }
}

export default EventRegistrationController;
