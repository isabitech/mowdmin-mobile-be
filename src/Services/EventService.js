
import { EventRepository } from "../repositories/EventRepository.js";

class EventService {
  async createEvent(data) {
    return await EventRepository.create(data);
  }

  async getAllEvents() {
    return await EventRepository.findAll({
      order: [["date", "ASC"]],
      // If you need registration/user info, fetch it separately using repositories
    });
  }

  async getEventById(id) {
    const event = await EventRepository.findById(id);

    if (!event) throw new Error("Event not found");
    return event;
  }

  async updateEvent(id, updates) {
    return await EventRepository.updateById(id, updates);
  }

  async deleteEvent(id) {
    return await EventRepository.deleteById(id);
  }
}

export default new EventService();
