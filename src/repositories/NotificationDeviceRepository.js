import { Op } from "sequelize";

let NotificationDeviceModel;

const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";

export const NotificationDeviceRepository = {
  async getModel() {
    if (!NotificationDeviceModel) {
      if (getIsMongo()) {
        NotificationDeviceModel = (
          await import("../MongoModels/NotificationDeviceMongoModel.js")
        ).default;
      } else {
        NotificationDeviceModel = (
          await import("../Models/NotificationDeviceModel.js")
        ).default;
      }
    }

    return NotificationDeviceModel;
  },

  async findByToken(token) {
    const Model = await this.getModel();
    return getIsMongo()
      ? Model.findOne({ token })
      : Model.findOne({ where: { token } });
  },

  async upsertByToken(token, payload) {
    const Model = await this.getModel();

    if (getIsMongo()) {
      return Model.findOneAndUpdate(
        { token },
        { ...payload, token },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );
    }

    const existing = await Model.findOne({ where: { token } });
    if (existing) {
      return existing.update(payload);
    }

    return Model.create({ ...payload, token });
  },

  async deactivateByToken(token, userId = null) {
    const Model = await this.getModel();

    if (getIsMongo()) {
      const filter = userId ? { token, userId } : { token };
      return Model.findOneAndUpdate(
        filter,
        { isActive: false },
        { new: true },
      );
    }

    const where = userId ? { token, userId } : { token };
    const device = await Model.findOne({ where });
    if (!device) return null;
    return device.update({ isActive: false });
  },

  async findActiveByUserIds(userIds = []) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return [];
    }

    const Model = await this.getModel();

    if (getIsMongo()) {
      return Model.find({
        userId: { $in: userIds },
        isActive: true,
      })
        .sort({ updatedAt: -1 })
        .lean();
    }

    return Model.findAll({
      where: {
        userId: {
          [Op.in]: userIds,
        },
        isActive: true,
      },
      order: [["updatedAt", "DESC"]],
    });
  },

  async deactivateManyByTokens(tokens = []) {
    if (!Array.isArray(tokens) || tokens.length === 0) {
      return 0;
    }

    const Model = await this.getModel();

    if (getIsMongo()) {
      const result = await Model.updateMany(
        { token: { $in: tokens } },
        { $set: { isActive: false } },
      );
      return result.modifiedCount || 0;
    }

    const [updatedCount] = await Model.update(
      { isActive: false },
      {
        where: {
          token: {
            [Op.in]: tokens,
          },
        },
      },
    );

    return updatedCount;
  },
};

export default NotificationDeviceRepository;
