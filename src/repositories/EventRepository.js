import Event from "../Models/EventModel.js";

export const EventRepository = {
  create: (payload) => Event.create(payload),
  findAll: (options = {}) => Event.findAll(options),
  findById: (id, options = {}) => Event.findByPk(id, options),
  deleteById: (id, options = {}) => Event.destroy({ where: { id }, ...options }),
};
