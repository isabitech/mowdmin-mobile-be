import Prayer from "../Models/PrayerModel.js";

export const PrayerRepository = {
  create: (payload) => Prayer.create(payload),
  findById: (id, options = {}) => Prayer.findByPk(id, options),
  findOne: (where, options = {}) => Prayer.findOne({ where, ...options }),
  findAll: (options = {}) => Prayer.findAll(options),
  deleteById: (id, options = {}) => Prayer.destroy({ where: { id }, ...options }),
};
