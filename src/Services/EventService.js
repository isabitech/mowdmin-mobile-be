import { EventRepository } from "../repositories/EventRepository.js";
import { Op } from "sequelize"; // For SQL databases

class EventService {
  async createEvent(data) {
    return await EventRepository.create(data);
  }

  async getAllEvents({ pagination, year, includePastEvents = false } = {}) {
    const paginationOptions = pagination ? { ...pagination } : {};

    // Get today's date (start of day) to filter out past events
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let whereClause = {};
    if (!includePastEvents) {
      // Filter to only show events from today onwards
      if (process.env.DB_CONNECTION === "mongodb") {
        whereClause = { date: { $gte: today } };
      } else {
        whereClause = {
          date: {
            [Op.gte]: today,
          },
        };
      }
    }

    return await EventRepository.findAll({
      where: whereClause,
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

  async getAllEventsAdmin(pagination = {}) {
    // Admin method to get all events including past ones
    return await EventRepository.findAll({
      order: [["date", "ASC"]],
      ...pagination,
    });
  }

  async cleanupPastEvents() {
    // Service method to clean up past events
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { EventModel } = await EventRepository.getModels();

    let deletedCount = 0;
    if (process.env.DB_CONNECTION === "mongodb") {
      const result = await EventModel.deleteMany({ date: { $lt: today } });
      deletedCount = result.deletedCount;
    } else {
      deletedCount = await EventModel.destroy({
        where: { date: { [Op.lt]: today } },
      });
    }

    return {
      deletedCount,
      date: today.toISOString(),
    };
  }
}

export default new EventService();
