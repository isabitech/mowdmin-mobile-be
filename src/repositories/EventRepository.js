let EventModel;
let EventRegistrationModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const EventRepository = {
  async getModels() {
    if (!EventModel || (!isMongo && !EventRegistrationModel)) {
      if (isMongo) {
        EventModel = (await import('../MongoModels/EventMongoModel.js')).default;
        EventRegistrationModel = (await import('../MongoModels/EventRegistrationMongoModel.js')).default;
      } else {
        EventModel = (await import('../Models/EventModel.js')).default;
        EventRegistrationModel = (await import('../Models/EventRegistration.js')).default;
      }
    }
    return { EventModel, EventRegistrationModel };
  },

  async create(payload) {
    const { EventModel } = await this.getModels();
    return EventModel.create(payload);
  },

  async findAll(options = {}) {
    const { EventModel } = await this.getModels();
    if (isMongo) {
      // Use the options as filter if it's not a complex Sequelize object,
      // or extract the where clause if it is.
      const filter = options.where || options;
      return EventModel.find(filter);
    } else {
      return EventModel.findAll(options);
    }
  },

  async findById(id, options = {}) {
    const { EventModel, EventRegistrationModel } = await this.getModels();
    if (isMongo) {
      return EventModel.findById(id).populate('registrations');
    } else {
      return EventModel.findByPk(id, {
        ...options,
        include: [
          {
            model: EventRegistrationModel,
            as: 'registrations' // Ensure this matches model association alias
          }
        ]
      });
    }
  },

  async deleteById(id, options = {}) {
    const { EventModel } = await this.getModels();
    if (isMongo) {
      const result = await EventModel.findByIdAndDelete(id);
      return !!result;
    } else {
      return EventModel.destroy({ where: { id }, ...options });
    }
  },
  async createRegistration(payload) {
    const { EventRegistrationModel } = await this.getModels();
    return EventRegistrationModel.create(payload);
  },
  async registrationfindAll(filter = {}) {
    const { EventRegistrationModel } = await this.getModels();
    if (isMongo) {
      return EventRegistrationModel.find(filter);
    } else {
      return EventRegistrationModel.findAll({ where: filter });
    }
  },
};
