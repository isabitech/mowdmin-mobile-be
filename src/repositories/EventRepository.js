
let EventModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const EventRepository = {
  async getModel() {
    if (!EventModel) {
      if (isMongo) {
        EventModel = (await import('../MongoModels/EventMongoModel.js')).default;
      } else {
        EventModel = (await import('../Models/EventModel.js')).default;
      }
    }
    return EventModel;
  },

  async create(payload) {
    const Model = await this.getModel();
    return Model.create(payload);
  },
  async findAll(options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      // Only use filter for Mongo, ignore order/include
      return Model.find({});
    } else {
      return Model.findAll(options);
    }
  },
  async findById(id, options = {}) {
    const Model = await this.getModel();
    return isMongo ? Model.findById(id) : Model.findByPk(id, options);
  },
  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (isMongo) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      return Model.destroy({ where: { id }, ...options });
    }
  },
};
