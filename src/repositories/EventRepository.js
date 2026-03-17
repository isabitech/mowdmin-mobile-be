import mongoose from "mongoose";

let EventModel;
let EventRegistrationModel;

const isMongo = () => process.env.DB_CONNECTION === "mongodb";
const DEFAULT_EVENT_PAGE_SIZE = 20;
const MAX_EVENT_PAGE_SIZE = 100;

export const EventRepository = {
  isValidId(id) {
    if (!isMongo()) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModels() {
    const mongoActive = isMongo();
    if (mongoActive) {
      if (!EventModel || !EventRegistrationModel) {
        EventModel = (await import("../MongoModels/EventMongoModel.js"))
          .default;
        EventRegistrationModel = (
          await import("../MongoModels/EventRegistrationMongoModel.js")
        ).default;
      }
    } else if (
      process.env.DB_CONNECTION === "postgres" ||
      process.env.DB_CONNECTION === "mysql"
    ) {
      if (!EventModel || !EventRegistrationModel) {
        EventModel = (await import("../Models/EventModel.js")).default;
        EventRegistrationModel = (
          await import("../Models/EventRegistration.js")
        ).default;
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
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_EVENT_PAGE_SIZE)
        : DEFAULT_EVENT_PAGE_SIZE;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    if (isMongo()) {
      const {
        where,
        order,
        include,
        limit: _limit,
        offset: _offset,
        ...rawFilter
      } = options;
      const filter = where || rawFilter;

      let query = EventModel.find(filter);

      // Handle ordering/sorting
      if (options.order) {
        // Convert Sequelize order [[field, direction], ...] to Mongoose sort { field: direction }
        const sort = {};
        options.order.forEach(([field, direction]) => {
          sort[field] = direction.toUpperCase() === "DESC" ? -1 : 1;
        });
        query = query.sort(sort);
      }

      query = query.limit(limit).skip(offset);

      return query
        .populate("registrations", "eventId userId status createdAt updatedAt")
        .lean();
    } else {
      return EventModel.findAll({ ...options, limit, offset });
    }
  },

  async findById(id, options = {}) {
    const { EventModel, EventRegistrationModel } = await this.getModels();
    if (isMongo) {
      if (!this.isValidId(id)) return null;
      return EventModel.findById(id).populate(
        "registrations",
        "eventId userId status createdAt updatedAt",
      );
    } else {
      return EventModel.findByPk(id, {
        ...options,
        include: [
          {
            model: EventRegistrationModel,
            as: "registrations", // Ensure this matches model association alias
          },
        ],
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
    if (isMongo()) {
      if (!this.isValidId(id)) return null;
      return EventModel.findByIdAndUpdate(id, payload, { new: true }).populate(
        "registrations",
        "eventId userId status createdAt updatedAt",
      );
    } else {
      const event = await EventModel.findByPk(id, options);
      if (!event) return null;
      return event.update(payload);
    }
  },
  async createRegistration(payload) {
    const { EventModel, EventRegistrationModel } = await this.getModels();
    const registration = await EventRegistrationModel.create(payload);

    if (isMongo()) {
      await EventModel.findByIdAndUpdate(payload.eventId, {
        $push: { registrations: registration._id },
      });
      return await registration.populate([
        {
          path: "eventId",
          select: "title date time location description image type",
        },
        { path: "userId", select: "name email photo" },
      ]);
    }

    return registration.reload
      ? await registration.reload({
          include: [
            { model: EventModel, as: "event" },
            {
              model: (await import("../Models/UserModel.js")).default,
              as: "user",
            },
          ],
        })
      : registration;
  },
  async registrationfindAll(options = {}) {
    const { EventRegistrationModel } = await this.getModels();
    if (isMongo()) {
      const filter =
        options.where ||
        (options.order || options.limit || options.offset || options.include
          ? {}
          : options);
      let query = EventRegistrationModel.find(filter);

      if (options.order) {
        const sort = {};
        options.order.forEach(([field, direction]) => {
          sort[field] = direction.toUpperCase() === "DESC" ? -1 : 1;
        });
        query = query.sort(sort);
      }
      if (options.limit) query = query.limit(options.limit);
      if (options.offset) query = query.skip(options.offset);

      return await query.populate([
        {
          path: "eventId",
          select: "title date time location description image type",
        },
        { path: "userId", select: "name email photo" },
      ]);
    } else {
      const { default: Event } = await import("../Models/EventModel.js");
      const { default: User } = await import("../Models/UserModel.js");
      const seqOptions =
        options.where || options.order || options.limit
          ? options
          : { where: options };
      return EventRegistrationModel.findAll({
        ...seqOptions,
        include: [
          { model: Event, as: "event" },
          { model: User, as: "user" },
        ],
      });
    }
  },

  async registrationFindById(id) {
    const { EventRegistrationModel } = await this.getModels();
    if (isMongo()) {
      if (!this.isValidId(id)) return null;
      return await EventRegistrationModel.findById(id).populate([
        {
          path: "eventId",
          select: "title date time location description image type",
        },
        { path: "userId", select: "name email photo" },
      ]);
    } else {
      const { default: Event } = await import("../Models/EventModel.js");
      const { default: User } = await import("../Models/UserModel.js");
      return await EventRegistrationModel.findByPk(id, {
        include: [
          { model: Event, as: "event" },
          { model: User, as: "user" },
        ],
      });
    }
  },

  async unregister(eventId, userId) {
    const { EventModel, EventRegistrationModel } = await this.getModels();
    if (isMongo()) {
      const registration = await EventRegistrationModel.findOneAndDelete({
        eventId,
        userId,
      }).populate([
        {
          path: "eventId",
          select: "title date time location description image type",
        },
        { path: "userId", select: "name email photo" },
      ]);
      if (registration) {
        await EventModel.findByIdAndUpdate(eventId, {
          $pull: { registrations: registration._id },
        });
      }
      return registration;
    } else {
      const { default: Event } = await import("../Models/EventModel.js");
      const { default: User } = await import("../Models/UserModel.js");

      const registration = await EventRegistrationModel.findOne({
        where: { eventId, userId },
        include: [
          { model: Event, as: "event" },
          { model: User, as: "user" },
        ],
      });

      if (registration) {
        await registration.destroy();
      }
      return registration;
    }
  },
};
