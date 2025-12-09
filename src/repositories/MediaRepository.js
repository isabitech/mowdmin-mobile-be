import Media from "../Models/MediaModel.js";

export const MediaRepository = {
  create: (payload) => Media.create(payload),
  findAll: (options = {}) => Media.findAll(options),
  findById: (id, options = {}) => Media.findByPk(id, options),
  updateById: (id, payload, options = {}) =>
    Media.update(payload, { where: { id }, returning: true, ...options }),
  deleteById: (id, options = {}) => Media.destroy({ where: { id }, ...options }),
};
