let NotificationModel;
const isMongo = process.env.DB_CONNECTION === "mongodb";
const DEFAULT_NOTIFICATION_PAGE_SIZE = 20;
const MAX_NOTIFICATION_PAGE_SIZE = 100;

const isValidMongoId = (id) => {
  if (!isMongo) return true;
  return /^[0-9a-fA-F]{24}$/.test(String(id || ""));
};

export const NotificationRepository = {
  async getModel() {
    if (!NotificationModel) {
      if (isMongo) {
        NotificationModel = (
          await import("../MongoModels/NotificationMongoModel.js")
        ).default;
      } else {
        NotificationModel = (await import("../Models/NotificationModel.js"))
          .default;
      }
    }
    return NotificationModel;
  },

  async create(payload) {
    const Model = await this.getModel();
    return Model.create(payload);
  },
  async findAllByUserId(userId, options = {}) {
    const Model = await this.getModel();
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_NOTIFICATION_PAGE_SIZE)
        : DEFAULT_NOTIFICATION_PAGE_SIZE;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    if (isMongo) {
      let query = Model.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
      return query.lean();
    }
    return Model.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      ...options,
      limit,
      offset,
    });
  },
  async findById(id) {
    const Model = await this.getModel();
    return isMongo ? Model.findById(id) : Model.findByPk(id);
  },
  async updateById(id, payload) {
    const Model = await this.getModel();
    if (isMongo) {
      return Model.findByIdAndUpdate(id, payload, { new: true });
    } else {
      return Model.update(payload, { where: { id }, returning: true });
    }
  },

  async markAsReadByUserId(id, userId) {
    const Model = await this.getModel();
    if (isMongo) {
      if (!isValidMongoId(id)) return null;
      return Model.findOneAndUpdate(
        { _id: id, userId },
        { isRead: true },
        { new: true },
      );
    }

    const notification = await Model.findOne({ where: { id, userId } });
    if (!notification) return null;
    notification.read = true;
    return notification.save();
  },
};
