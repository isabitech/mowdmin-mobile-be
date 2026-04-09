import { EventRepository } from "../repositories/EventRepository.js";

class EventRegistrationService {
  async createEventReg(data) {
    const registrationData = {
      eventId: data.eventId,
      status: "registered",
      userId: data.userId,
    };
    return await EventRepository.createRegistration(registrationData);
  }

  async getAllReg() {
    // For MongoDB, populate userId and eventId manually if needed
    return await EventRepository.registrationfindAll();
  }

  async getRegById(id) {
    const reg = await EventRepository.registrationFindById(id);
    if (!reg) return null;
    return reg;
  }

  async updateEventReg(id, updates) {
    return EventRepository.updateRegistrationById
      ? EventRepository.updateRegistrationById(id, updates)
      : null;
  }

  async deleteEventReg(id) {
    return EventRepository.deleteRegistrationById
      ? EventRepository.deleteRegistrationById(id)
      : null;
  }

  async getByEventId(eventId) {
    const registrations = await EventRepository.registrationfindAll({
      eventId,
    });
    if (!registrations || registrations.length === 0)
      throw new Error("Resource not found");
    return registrations;
  }

  async getByUserId(userId) {
    return await EventRepository.registrationfindAll({ userId });
  }

  async unregister(eventId, userId) {
    return await EventRepository.unregister(eventId, userId);
  }
}

export default new EventRegistrationService();
