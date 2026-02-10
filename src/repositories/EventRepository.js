import mongoose from 'mongoose';

let EventModel;
let EventRegistrationModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const EventRepository = {
  isValidId(id) {
    if (!isMongo) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
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

      return query.populate('registrations');
    } else {
      return EventModel.findAll(options);
    }
  },

  async findById(id, options = {}) {
    const { EventModel, EventRegistrationModel } = await this.getModels();
    if (isMongo) {
      if (!this.isValidId(id)) return null;
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
      if (!this.isValidId(id)) return false;
      const result = await EventModel.findByIdAndDelete(id);
      return !!result;
    } else {
      return EventModel.destroy({ where: { id }, ...options });
    }
  },
  async updateById(id, payload, options = {}) {
    const { EventModel } = await this.getModels();
    if (isMongo) {
      if (!this.isValidId(id)) return null;
      return EventModel.findByIdAndUpdate(id, payload, { new: true }).populate('registrations');
    } else {
      const event = await EventModel.findByPk(id, options);
      if (!event) return null;
      return event.update(payload);
    }
  },
  async createRegistration(payload) {
    const { EventModel, EventRegistrationModel } = await this.getModels();
    const registration = await EventRegistrationModel.create(payload);

    if (isMongo) {
      await EventModel.findByIdAndUpdate(payload.eventId, {
        $push: { registrations: registration._id }
      });
    }

    return registration;
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

  async unregister(eventId, userId) {
    const { EventModel, EventRegistrationModel } = await this.getModels();
    if (isMongo) {
      const registration = await EventRegistrationModel.findOneAndDelete({ eventId, userId });
      if (registration) {
        await EventModel.findByIdAndUpdate(eventId, {
          $pull: { registrations: registration._id }
        });
      }
      return !!registration;
    } else {
      const result = await EventRegistrationModel.destroy({ where: { eventId, userId } });
      return result > 0;
    }
  },
};
