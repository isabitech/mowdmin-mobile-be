import EventRegistrationService from "../Services/EventRegistration.js";
import { success } from "../Utils/helper.js";

class EventRegistrationController {

    static async create(req, res) {
        const { eventId, ticketCode } = req.body;
        const userId = req.user.id;

        const data = {
            userId,
            eventId,
            ticketCode
        };
        const registration = await EventRegistrationService.createEventReg(data);
        return success(res, "Registration created successfully", registration);
    }

    static async GetAll(req, res) {
        const registrations = await EventRegistrationService.getAllReg();
        return success(res, "All event registrations fetched successfully", registrations);
    }

    static async GetAllByEventId(req, res) {
        const { eventId } = req.params; // use params for IDs in route
        const registrations = await EventRegistrationService.getByEventId(eventId);
        return success(res, "Registrations fetched successfully", registrations);
    }

    static async GetById(req, res) {
        const { id } = req.params;
        const registration = await EventRegistrationService.getRegById(id);
        return success(res, "Registration fetched successfully", registration);
    }

    static async Update(req, res) {
        const { eventId, ticketCode, userId, status } = req.body;
        const { id } = req.params;

        const data = { userId, eventId, ticketCode, status };

        const registration = await EventRegistrationService.updateEventReg(id, data);
        return success(res, "Registration updated successfully", registration);
    }

    static async Delete(req, res) {
        const { id } = req.params;
        await EventRegistrationService.deleteEventReg(id);
        return success(res, "Registration deleted successfully");
    }
    static async GetAllByUser(req, res) {
        const userId = req.user.id;
        const registrations = await EventRegistrationService.getByUserId(userId);
        return success(res, "User registrations fetched successfully", registrations);
    }

}

export default EventRegistrationController;
