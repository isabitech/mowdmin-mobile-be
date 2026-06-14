import { Op } from "sequelize";

let NotificationDispatchLogModel;

const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";

export const NotificationDispatchLogRepository = {
  async getModel() {
    if (!NotificationDispatchLogModel) {
      if (getIsMongo()) {
        NotificationDispatchLogModel = (
          await import("../MongoModels/NotificationDispatchLogMongoModel.js")
        ).default;
      } else {
        NotificationDispatchLogModel = (
          await import("../Models/NotificationDispatchLogModel.js")
        ).default;
      }
    }

    return NotificationDispatchLogModel;
  },

  async findByReferenceKeyAndUserIds(referenceKey, userIds = []) {
    if (!referenceKey || !Array.isArray(userIds) || userIds.length === 0) {
      return [];
    }

    const Model = await this.getModel();

    if (getIsMongo()) {
      return Model.find({
        referenceKey,
        userId: { $in: userIds },
      }).lean();
    }

    return Model.findAll({
      where: {
        referenceKey,
        userId: {
          [Op.in]: userIds,
        },
      },
    });
  },

  async upsertMany(referenceKey, userIds = [], updates = {}) {
    if (!referenceKey || !Array.isArray(userIds) || userIds.length === 0) {
      return [];
    }

    const Model = await this.getModel();
    const payloads = userIds.map((userId) => ({
      userId,
      referenceKey,
      ...updates,
    }));

    if (getIsMongo()) {
      await Model.bulkWrite(
        payloads.map((payload) => ({
          updateOne: {
            filter: {
              userId: payload.userId,
              referenceKey: payload.referenceKey,
            },
            update: {
              $set: payload,
            },
            upsert: true,
          },
        })),
        { ordered: false },
      );

      return Model.find({
        referenceKey,
        userId: { $in: userIds },
      }).lean();
    }

    const updateFields = Object.keys(updates);
    await Model.bulkCreate(payloads, {
      updateOnDuplicate: updateFields,
    });

    return Model.findAll({
      where: {
        referenceKey,
        userId: {
          [Op.in]: userIds,
        },
      },
    });
  },
};

export default NotificationDispatchLogRepository;
