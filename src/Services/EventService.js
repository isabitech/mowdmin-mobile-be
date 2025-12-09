import EventRegistration from "../Models/EventRegistration.js";
import User from "../Models/UserModel.js";
import { EventRepository } from "../repositories/EventRepository.js";

class EventService {
  async createEvent(data) {
    return await EventRepository.create(data);
  }

  async getAllEvents() {
    return await EventRepository.findAll({
      order: [["date", "ASC"]],
      include: [
        {
          model: EventRegistration,
          as: "registrations",
          include: [{ model: User, as: "user" }],
        },
      ],
    });
  }

  async getEventById(id) {
    const event = await EventRepository.findById(id, {
      include: [
        {
          model: EventRegistration,
          as: "registrations",
          include: [{ model: User, as: "user" }],
        },
      ],
    });

    if (!event) throw new Error("Event not found");
    return event;
  }

  async updateEvent(id, updates) {
    const event = await this.getEventById(id);
    await event.update(updates);
    return event;
  }

  async deleteEvent(id) {
    const event = await this.getEventById(id);
    await event.destroy();
    return true;
  }
}

export default new EventService();
