
import { UserRepository } from "../repositories/UserRepository.js";
import { EventRepository } from "../repositories/EventRepository.js";

class EventRegistrationService {
    async createEventReg(data) {
        const registrationData = {
            eventId: data.eventId,
            userId: data.userId,
            ticketCode: data.ticketCode ?? null,
            status: "registered",
        };
        return await EventRepository.create(registrationData);
    }

    async getAllReg() {
        // For MongoDB, populate userId and eventId manually if needed
        return await EventRepository.findAll();
    }

    async getRegById(id) {
        const reg = await EventRepository.findById(id);
        if (!reg) throw new Error("Event registration not found");
        return reg;
    }

    async updateEventReg(id, updates) {
        return await EventRepository.updateById
            ? EventRepository.updateById(id, updates)
            : null;
    }

    async deleteEventReg(id) {
        return await EventRepository.deleteById
            ? EventRepository.deleteById(id)
            : null;
    }

    async getByEventId(eventId) {
        const registrations = await EventRepository.findAll({ eventId });
        if (!registrations || registrations.length === 0)
            throw new Error("No registrations found for this event");
        return registrations;
    }

    async getByUserId(userId) {
        return await EventRepository.findAll({ userId });
    }
}

export default new EventRegistrationService();
