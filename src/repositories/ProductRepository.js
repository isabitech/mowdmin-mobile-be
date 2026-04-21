let ProductModel;
const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";
const DEFAULT_PRODUCT_PAGE_SIZE = 20;
const MAX_PRODUCT_PAGE_SIZE = 100;

export const ProductRepository = {
  async getModel() {
    if (!ProductModel) {
      if (getIsMongo()) {
        ProductModel = (await import("../MongoModels/ProductMongoModel.js"))
          .default;
      } else {
        ProductModel = (await import("../Models/ProductModel.js")).default;
      }
    }
    return ProductModel;
  },

  async create(data) {
    const Model = await this.getModel();
    return Model.create(data);
  },

  async findById(id, options = {}) {
    const Model = await this.getModel();
    return getIsMongo() ? Model.findById(id) : Model.findByPk(id, options);
  },

  async findOne(where, options = {}) {
    const Model = await this.getModel();
    return getIsMongo()
      ? Model.findOne(where)
      : Model.findOne({ where, ...options });
  },

  async findAll(options = {}) {
    const Model = await this.getModel();
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_PRODUCT_PAGE_SIZE)
        : DEFAULT_PRODUCT_PAGE_SIZE;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    if (getIsMongo()) {
      const {
        where,
        order,
        include,
        limit: _limit,
        offset: _offset,
        ...rawFilter
      } = options;
      const filter = where || rawFilter;
      let query = Model.find(filter).skip(offset).limit(limit);

      if (order?.length) {
        const sort = {};
        order.forEach(([field, direction]) => {
          sort[field] = direction.toUpperCase() === "DESC" ? -1 : 1;
        });
        query = query.sort(sort);
      }

      return query.lean();
    } else {
      return Model.findAll({ ...options, limit, offset });
    }
  },

  async findAllWithCount(options = {}) {
    const Model = await this.getModel();
    const parsedLimit = Number.parseInt(options.limit, 10);
    const parsedOffset = Number.parseInt(options.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_PRODUCT_PAGE_SIZE)
        : DEFAULT_PRODUCT_PAGE_SIZE;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    if (getIsMongo()) {
      const {
        where,
        order,
        include,
        limit: _limit,
        offset: _offset,
        ...rawFilter
      } = options;
      const filter = where || rawFilter;
      let query = Model.find(filter).skip(offset).limit(limit);

      if (order?.length) {
        const sort = {};
        order.forEach(([field, direction]) => {
          sort[field] = direction.toUpperCase() === "DESC" ? -1 : 1;
        });
        query = query.sort(sort);
      }

      const [items, total] = await Promise.all([
        query.lean(),
        Model.countDocuments(filter),
      ]);

      return { items, total };
    } else {
      const { rows, count } = await Model.findAndCountAll({
        ...options,
        limit,
        offset,
      });
      return { items: rows, total: count };
    }
  },

  async updateById(id, data, options = {}) {
    const Model = await this.getModel();
    if (getIsMongo()) {
      return Model.findByIdAndUpdate(id, data, { new: true });
    } else {
      const product = await Model.findByPk(id, options);
      if (!product) return null;
      return product.update(data);
    }
  },

  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (getIsMongo()) {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    } else {
      const product = await Model.findByPk(id, options);
      if (!product) return null;
      await product.destroy();
      return true;
    }
  },

  async findAllByUserId(userId, options = {}) {
    const Model = await this.getModel();
    if (getIsMongo()) {
      const {
        where,
        order,
        include,
        limit: rawLimit,
        offset: rawOffset,
        ...rawFilter
      } = options;
      const parsedLimit = Number.parseInt(rawLimit, 10);
      const parsedOffset = Number.parseInt(rawOffset, 10);
      const limit =
        Number.isFinite(parsedLimit) && parsedLimit > 0
          ? Math.min(parsedLimit, MAX_PRODUCT_PAGE_SIZE)
          : DEFAULT_PRODUCT_PAGE_SIZE;
      const offset =
        Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

      const filter = where || rawFilter;
      let query = Model.find({ userId, ...filter })
        .skip(offset)
        .limit(limit);

      if (order?.length) {
        const sort = {};
        order.forEach(([field, direction]) => {
          sort[field] = direction.toUpperCase() === "DESC" ? -1 : 1;
        });
        query = query.sort(sort);
      }

      return query.lean();
    }

    return Model.findAll({ where: { userId }, ...options });
  },
};

export default ProductRepository;
