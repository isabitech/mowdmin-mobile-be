import Event from "../Models/EventModel.js";
import EventRegistration from "../Models/EventRegistration.js";
import User from "../Models/UserModel.js";

class EventRegistrationService {
    async createEventReg(data) {
        const registrationData = {
            eventId: data.eventId,       // use model field name
            userId: data.userId,         // use model field name
            ticketCode: data.ticketCode ?? null,
            status: "registered",
        };

        return await EventRegistration.create(registrationData);
    }

    async getAllReg() {
        return await EventRegistration.findAll({
            order: [["createdAt", "ASC"]], // <-- use camelCase as per Sequelize timestamps
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email"] },
                { model: Event, as: "event", attributes: ["id", "title", "date","time", "location"] }, // match Event model field names
            ],
        });
    }


    async getRegById(id) {
        const reg = await EventRegistration.findByPk(id, {
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email"] },
                { model: Event, as: "event", attributes: ["id", "title", "date","time", "location"] },
            ],
        });
        if (!reg) throw new Error("Event registration not found");
        return reg;
    }

    async updateEventReg(id, updates) {
        const reg = await this.getRegById(id);
        await reg.update(updates);
        return reg;
    }

    async deleteEventReg(id) {
        const reg = await this.getRegById(id);
        await reg.destroy();
        return true;
    }

    async getByEventId(eventId) {
        const registrations = await EventRegistration.findAll({
            where: { event_id: eventId },
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email"] },
                { model: Event, as: "event", attributes: ["id", "title", "date", "time", "location"] },
            ],
            order: [["createdAt", "ASC"]],
        });

        if (!registrations || registrations.length === 0)
            throw new Error("No registrations found for this event");

        return registrations;
    }
    async getByUserId(userId) {
        const registrations = await EventRegistration.findAll({
            where: {  userId },
            include: [
                { model: Event, as: "event", attributes: ["id", "title", "date","time", "location"] },
            ],
            order: [["createdAt", "DESC"]],
        });

        return registrations;
    }

}

export default new EventRegistrationService();
