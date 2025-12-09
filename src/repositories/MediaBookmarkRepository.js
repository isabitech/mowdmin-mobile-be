import MediaBookmark from "../Models/MediaBookmarksModel.js";

export const MediaBookmarkRepository = {
  create: (payload) => MediaBookmark.create(payload),
  findAll: (options = {}) => MediaBookmark.findAll(options),
  findAllByUserId: (userId, options = {}) =>
    MediaBookmark.findAll({ where: { userId }, ...options }),
  findById: (id, options = {}) => MediaBookmark.findByPk(id, options),
  updateById: (id, payload, options = {}) =>
    MediaBookmark.update(payload, { where: { id }, returning: true, ...options }),
  deleteById: (id, options = {}) => MediaBookmark.destroy({ where: { id }, ...options }),
};
