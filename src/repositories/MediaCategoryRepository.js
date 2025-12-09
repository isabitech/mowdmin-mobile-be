import MediaCategory from "../Models/MediaCategory.js";

export const MediaCategoryRepository = {
  create: (payload) => MediaCategory.create(payload),
  findAll: () => MediaCategory.findAll(),
  findById: (id) => MediaCategory.findByPk(id),
  updateById: (id, payload) => MediaCategory.update(payload, { where: { id }, returning: true }),
  deleteById: (id) => MediaCategory.destroy({ where: { id } }),
};
