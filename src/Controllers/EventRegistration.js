import EventRegistrationService from "../Services/EventRegistration.js";
import { sendSuccess, sendError } from "../core/response.js";

class EventRegistrationController {

    static async create(req, res) {
        const { eventId } = req.body;
        console.log("Creating registration for eventId:", eventId);
        const userId = req.user.id;
        const data = { userId, eventId };
        const registration = await EventRegistrationService.createEventReg(data);
        return sendSuccess(res, { message: "Registration created successfully", data: registration });
    }

    static async GetAll(req, res) {
        const registrations = await EventRegistrationService.getAllReg();
        return sendSuccess(res, { message: "All event registrations fetched successfully", data: registrations });
    }
    static async GetAllByEventId(req, res) {
        const { eventId } = req.params; // use params for IDs in route
        const registrations = await EventRegistrationService.getByEventId(eventId);
        return sendSuccess(res, { message: "Registrations fetched successfully", data: registrations });
    }
    static async GetById(req, res) {
        const { id } = req.params;
        const registration = await EventRegistrationService.getRegById(id);
        if (!registration) {
            return sendError(res, { message: "Registration not found", statusCode: 404 });
        }
        return sendSuccess(res, { message: "Registration fetched successfully", data: registration });
    }
    static async Update(req, res) {
        const { eventId, ticketCode, userId, status } = req.body;
        const { id } = req.params;
        const data = { userId, eventId, ticketCode, status };
        const registration = await EventRegistrationService.updateEventReg(id, data);
        if (!registration) {
            return sendError(res, { message: "Registration not found", statusCode: 404 });
        }
        return sendSuccess(res, { message: "Registration updated successfully", data: registration });
    }
    static async Delete(req, res) {
        const { id } = req.params;
        const deleted = await EventRegistrationService.deleteEventReg(id);
        if (!deleted) {
            return sendError(res, { message: "Registration not found", statusCode: 404 });
        }
        return sendSuccess(res, { message: "Registration deleted successfully", data: {} });
    }
    static async GetAllByUser(req, res) {
        const userId = req.user.id;
        const registrations = await EventRegistrationService.getByUserId(userId);
        return sendSuccess(res, { message: "User registrations fetched successfully", data: registrations });
    }

    static async Unregister(req, res) {
        const { eventId } = req.params;
        const userId = req.user.id;
        const result = await EventRegistrationService.unregister(eventId, userId);
        if (!result) {
            return sendError(res, { message: "Registration not found or already removed", statusCode: 404 });
        }
        return sendSuccess(res, { message: "Unregistered successfully" });
    }

}

export default EventRegistrationController;
