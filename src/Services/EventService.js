import { EventRepository } from "../repositories/EventRepository.js";

class EventService {
  async createEvent(data) {
    return await EventRepository.create(data);
  }

  async getAllEvents({ pagination, year } = {}) {
    const paginationOptions = pagination ? { ...pagination } : {};
    return await EventRepository.findAll({
      order: [["date", "ASC"]],
      year,
      ...paginationOptions,
    });
  }

  async getAllEventsWithCount({ pagination, year } = {}) {
    const paginationOptions = pagination ? { ...pagination } : {};
    return await EventRepository.findAllWithCount({
      order: [["date", "ASC"]],
      year,
      ...paginationOptions,
    });
  }

  async getEventById(id) {
    const event = await EventRepository.findById(id);

    if (!event) throw new Error("Resource not found");
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
