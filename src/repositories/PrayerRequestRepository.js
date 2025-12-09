import PrayerRequest from "../Models/PrayerRequestModel.js";

export const PrayerRequestRepository = {
  create: (data) => PrayerRequest.create(data),
  findById: (id, options = {}) => PrayerRequest.findByPk(id, options),
  findOne: (where, options = {}) => PrayerRequest.findOne({ where, ...options }),
  findAll: (options = {}) => PrayerRequest.findAll(options),
  updateById: async (id, data, options = {}) => {
    const prayerRequest = await PrayerRequest.findByPk(id, options);
    if (!prayerRequest) return null;
    return prayerRequest.update(data);
  },
  deleteById: async (id, options = {}) => {
    const prayerRequest = await PrayerRequest.findByPk(id, options);
    if (!prayerRequest) return null;
    await prayerRequest.destroy();
    return true;
  },
  findAllByUserId: (userId, options = {}) =>
    PrayerRequest.findAll({ where: { userId }, ...options }),
};
