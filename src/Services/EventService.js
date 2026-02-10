
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
    const event = await this.getEventById(id);
    if (event.update) {
      // Sequelize instance
      await event.update(updates);
      return event;
    } else if (event.save) {
      // Mongoose document
      Object.assign(event, updates);
      await event.save();
      return event;
    } else {
      throw new Error('Event update not supported for this model instance');
    }
  }

  async deleteEvent(id) {
    return await EventRepository.deleteById(id);
  }
}

export default new EventService();
