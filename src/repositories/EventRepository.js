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
      // Extract filter from 'where' or use the whole object if it doesn't look like Sequelize options
      const filter = options.where || (options.order || options.limit || options.offset || options.include ? {} : options);

      let query = EventModel.find(filter);

      // Handle ordering/sorting
      if (options.order) {
        // Convert Sequelize order [[field, direction], ...] to Mongoose sort { field: direction }
        const sort = {};
        options.order.forEach(([field, direction]) => {
          sort[field] = direction.toUpperCase() === 'DESC' ? -1 : 1;
        });
        query = query.sort(sort);
      }

      if (options.limit) query = query.limit(options.limit);
      if (options.offset) query = query.skip(options.offset);

      return query;
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
  async registrationfindAll(options = {}) {
    const { EventRegistrationModel } = await this.getModels();
    if (isMongo) {
      const filter = options.where || (options.order || options.limit || options.offset || options.include ? {} : options);
      let query = EventRegistrationModel.find(filter);

      if (options.order) {
        const sort = {};
        options.order.forEach(([field, direction]) => {
          sort[field] = direction.toUpperCase() === 'DESC' ? -1 : 1;
        });
        query = query.sort(sort);
      }
      if (options.limit) query = query.limit(options.limit);
      if (options.offset) query = query.skip(options.offset);

      return query;
    } else {
      // If it's already a sequelize options object (has where/order/etc), use it as is.
      // Otherwise, wrap the filter in a where clause.
      const seqOptions = options.where || options.order || options.limit ? options : { where: options };
      return EventRegistrationModel.findAll(seqOptions);
    }
  },
};
