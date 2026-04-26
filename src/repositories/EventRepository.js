import "../env.js";
import mongoose from "mongoose";
import { Op } from "sequelize";

let EventModel;
let EventRegistrationModel;

const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";
const DEFAULT_EVENT_PAGE_SIZE = 20;
const MAX_EVENT_PAGE_SIZE = 100;

export const EventRepository = {
  isValidId(id) {
    if (!getIsMongo()) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },
  async getModels() {
    const mongoActive = getIsMongo();
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
    const { year, ...optionsWithoutYear } = options;
    const parsedYear = Number.parseInt(year, 10);
    const useYearFilter = Number.isFinite(parsedYear);
    const yearStart = useYearFilter ? new Date(parsedYear, 0, 1) : null;
    const yearEnd = useYearFilter ? new Date(parsedYear + 1, 0, 1) : null;

    const hasLimit = Object.prototype.hasOwnProperty.call(
      optionsWithoutYear,
      "limit",
    );
    const hasOffset = Object.prototype.hasOwnProperty.call(
      optionsWithoutYear,
      "offset",
    );
    const usePagination = hasLimit || hasOffset;

    let limit;
    let offset;

    if (usePagination) {
      const parsedLimit = Number.parseInt(optionsWithoutYear.limit, 10);
      const parsedOffset = Number.parseInt(optionsWithoutYear.offset, 10);
      limit =
        Number.isFinite(parsedLimit) && parsedLimit > 0
          ? Math.min(parsedLimit, MAX_EVENT_PAGE_SIZE)
          : DEFAULT_EVENT_PAGE_SIZE;
      offset =
        Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    }

    if (getIsMongo()) {
      const {
        where,
        order,
        include,
        limit: _limit,
        offset: _offset,
        ...rawFilter
      } = optionsWithoutYear;
      const filter = where || rawFilter;

      if (useYearFilter) {
        const dateRange = { $gte: yearStart, $lt: yearEnd };
        if (
          filter.date &&
          typeof filter.date === "object" &&
          !Array.isArray(filter.date)
        ) {
          filter.date = { ...filter.date, ...dateRange };
        } else {
          filter.date = dateRange;
        }
      }

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

      if (usePagination) {
        query = query.limit(limit).skip(offset);
      }

      return query
        .populate("registrations", "eventId userId status createdAt updatedAt")
        .lean();
    } else {
      const finalOptions = { ...optionsWithoutYear };
      if (useYearFilter) {
        const dateRange = { [Op.gte]: yearStart, [Op.lt]: yearEnd };
        if (finalOptions.where) {
          const existingDate = finalOptions.where.date;
          if (
            existingDate &&
            typeof existingDate === "object" &&
            !Array.isArray(existingDate)
          ) {
            finalOptions.where.date = { ...existingDate, ...dateRange };
          } else {
            finalOptions.where = { ...finalOptions.where, date: dateRange };
          }
        } else {
          finalOptions.where = { date: dateRange };
        }
      }
      if (usePagination) {
        finalOptions.limit = limit;
        finalOptions.offset = offset;
      } else {
        delete finalOptions.limit;
        delete finalOptions.offset;
      }
      return EventModel.findAll(finalOptions);
    }
  },

  async findAllWithCount(options = {}) {
    const { EventModel } = await this.getModels();
    const { year, ...optionsWithoutYear } = options;
    const parsedYear = Number.parseInt(year, 10);
    const useYearFilter = Number.isFinite(parsedYear);
    const yearStart = useYearFilter ? new Date(parsedYear, 0, 1) : null;
    const yearEnd = useYearFilter ? new Date(parsedYear + 1, 0, 1) : null;

    const hasLimit = Object.prototype.hasOwnProperty.call(
      optionsWithoutYear,
      "limit",
    );
    const hasOffset = Object.prototype.hasOwnProperty.call(
      optionsWithoutYear,
      "offset",
    );
    const usePagination = hasLimit || hasOffset;

    let limit;
    let offset;

    if (usePagination) {
      const parsedLimit = Number.parseInt(optionsWithoutYear.limit, 10);
      const parsedOffset = Number.parseInt(optionsWithoutYear.offset, 10);
      limit =
        Number.isFinite(parsedLimit) && parsedLimit > 0
          ? Math.min(parsedLimit, MAX_EVENT_PAGE_SIZE)
          : DEFAULT_EVENT_PAGE_SIZE;
      offset =
        Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    }

    if (getIsMongo()) {
      const {
        where,
        order,
        include,
        limit: _limit,
        offset: _offset,
        ...rawFilter
      } = optionsWithoutYear;
      const filter = where || rawFilter;

      if (useYearFilter) {
        const dateRange = { $gte: yearStart, $lt: yearEnd };
        if (
          filter.date &&
          typeof filter.date === "object" &&
          !Array.isArray(filter.date)
        ) {
          filter.date = { ...filter.date, ...dateRange };
        } else {
          filter.date = dateRange;
        }
      }

      let query = EventModel.find(filter);

      if (options.order) {
        const sort = {};
        options.order.forEach(([field, direction]) => {
          sort[field] = direction.toUpperCase() === "DESC" ? -1 : 1;
        });
        query = query.sort(sort);
      }

      if (usePagination) {
        query = query.limit(limit).skip(offset);
      }

      const [items, total] = await Promise.all([
        query
          .populate(
            "registrations",
            "eventId userId status createdAt updatedAt",
          )
          .lean(),
        EventModel.countDocuments(filter),
      ]);

      return { items, total };
    } else {
      const finalOptions = { ...optionsWithoutYear };
      if (useYearFilter) {
        const dateRange = { [Op.gte]: yearStart, [Op.lt]: yearEnd };
        if (finalOptions.where) {
          const existingDate = finalOptions.where.date;
          if (
            existingDate &&
            typeof existingDate === "object" &&
            !Array.isArray(existingDate)
          ) {
            finalOptions.where.date = { ...existingDate, ...dateRange };
          } else {
            finalOptions.where = { ...finalOptions.where, date: dateRange };
          }
        } else {
          finalOptions.where = { date: dateRange };
        }
      }
      if (usePagination) {
        finalOptions.limit = limit;
        finalOptions.offset = offset;
      } else {
        delete finalOptions.limit;
        delete finalOptions.offset;
      }
      const { rows, count } = await EventModel.findAndCountAll(finalOptions);
      return { items: rows, total: count };
    }
  },

  async findById(id, options = {}) {
    const { EventModel, EventRegistrationModel } = await this.getModels();
    if (getIsMongo()) {
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
    if (getIsMongo()) {
      if (!this.isValidId(id)) return false;
      const result = await EventModel.findByIdAndDelete(id);
      return !!result;
    } else {
      return EventModel.destroy({ where: { id }, ...options });
    }
  },
  async updateById(id, payload, options = {}) {
    const { EventModel } = await this.getModels();
    if (getIsMongo()) {
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

    if (getIsMongo()) {
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
    if (getIsMongo()) {
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

  async registrationFindAllWithCount(options = {}) {
    const { EventRegistrationModel } = await this.getModels();
    if (getIsMongo()) {
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

      const [items, total] = await Promise.all([
        query.populate([
          {
            path: "eventId",
            select: "title date time location description image type",
          },
          { path: "userId", select: "name email photo" },
        ]),
        EventRegistrationModel.countDocuments(filter),
      ]);

      return { items, total };
    } else {
      const { default: Event } = await import("../Models/EventModel.js");
      const { default: User } = await import("../Models/UserModel.js");
      const seqOptions =
        options.where || options.order || options.limit
          ? options
          : { where: options };
      const { rows, count } = await EventRegistrationModel.findAndCountAll({
        ...seqOptions,
        include: [
          { model: Event, as: "event" },
          { model: User, as: "user" },
        ],
        distinct: true,
      });
      return { items: rows, total: count };
    }
  },

  async registrationFindById(id) {
    const { EventRegistrationModel } = await this.getModels();
    if (getIsMongo()) {
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

  async updateRegistrationById(id, payload) {
    const { EventRegistrationModel } = await this.getModels();
    if (getIsMongo()) {
      if (!this.isValidId(id)) return null;
      return EventRegistrationModel.findByIdAndUpdate(id, payload, {
        new: true,
      }).populate([
        {
          path: "eventId",
          select: "title date time location description image type",
        },
        { path: "userId", select: "name email photo" },
      ]);
    }

    const registration = await EventRegistrationModel.findByPk(id);
    if (!registration) return null;
    return registration.update(payload);
  },

  async deleteRegistrationById(id) {
    const { EventRegistrationModel, EventModel } = await this.getModels();
    if (getIsMongo()) {
      if (!this.isValidId(id)) return null;
      const registration = await EventRegistrationModel.findByIdAndDelete(id);
      if (registration?.eventId) {
        await EventModel.findByIdAndUpdate(registration.eventId, {
          $pull: { registrations: registration._id },
        });
      }
      return registration;
    }

    const registration = await EventRegistrationModel.findByPk(id);
    if (!registration) return null;
    await registration.destroy();
    return registration;
  },

  async unregister(eventId, userId) {
    const { EventModel, EventRegistrationModel } = await this.getModels();
    if (getIsMongo()) {
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
