let NotificationModel;
const isMongo = process.env.DB_CONNECTION === "mongodb";

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
    const limit = Number.isFinite(Number(options.limit))
      ? Number(options.limit)
      : 20;
    const offset = Number.isFinite(Number(options.offset))
      ? Number(options.offset)
      : 0;

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
      return Model.findOneAndUpdate(
        { _id: id, userId },
        { isRead: true },
        { new: true },
      );
    }

    const notification = await Model.findOne({ where: { id, userId } });
    if (!notification) return null;
    notification.isRead = true;
    return notification.save();
  },
};
