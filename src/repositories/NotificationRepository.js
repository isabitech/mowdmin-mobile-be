
let NotificationModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const NotificationRepository = {
  async getModel() {
    if (!NotificationModel) {
      if (isMongo) {
        NotificationModel = (await import('../MongoModels/NotificationMongoModel.js')).default;
      } else {
        NotificationModel = (await import('../Models/NotificationModel.js')).default;
      }
    }
    return NotificationModel;
  },

  async create(payload) {
    const Model = await this.getModel();
    return Model.create(payload);
  },
  async findAllByUserId(userId) {
    const Model = await this.getModel();
    return isMongo ? Model.find({ userId }) : Model.findAll({ where: { userId } });
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
};
