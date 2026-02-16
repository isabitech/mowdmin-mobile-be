let UserModel;
let ProfileModel;

const getIsMongo = () => process.env.DB_CONNECTION === 'mongodb';

export const UserRepository = {
  async getModels() {
    if (!UserModel || (!getIsMongo() && !ProfileModel)) {
      if (getIsMongo()) {
        const userImport = await import('../MongoModels/UserMongoModel.js');
        const profileImport = await import('../MongoModels/ProfileMongoModel.js');

        UserModel = userImport.default;
        ProfileModel = profileImport.default;
      } else {
        const userImport = await import('../Models/UserModel.js');
        const profileImport = await import('../Models/ProfileModel.js');

        UserModel = userImport.default;
        ProfileModel = profileImport.default;
      }
    }

    return { UserModel, ProfileModel };
  },

  async findByEmail(email) {
    const { UserModel, ProfileModel } = await this.getModels();

    if (getIsMongo()) {
      return UserModel.findOne({ email });
    }

    return UserModel.findOne({
      where: { email },
      include: [
        {
          model: ProfileModel,
          as: 'profile'
        }
      ]
    });
  },

  async findById(id) {
    const { UserModel } = await this.getModels();

    return getIsMongo()
      ? UserModel.findById(id)
      : UserModel.findByPk(id);
  },

  async create(payload) {
    const { UserModel } = await this.getModels();
    return UserModel.create(payload);
  },

  async findAll(options = {}) {
    const { UserModel } = await this.getModels();
    if (getIsMongo()) {
      const filter = options.where || (options.order || options.limit || options.offset || options.include ? {} : options);
      let query = UserModel.find(filter);

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
    }
    const seqOptions = options.where || options.order || options.limit ? options : { where: options };
    return UserModel.findAll(seqOptions);
  },

  async update(id, data) {
    const { UserModel } = await this.getModels();
    if (getIsMongo()) {
      return UserModel.findByIdAndUpdate(id, data, { new: true });
    }
    const user = await UserModel.findByPk(id);
    if (user) {
      return user.update(data);
    }
    return null;
  },

  async findOne(where) {
    const { UserModel } = await this.getModels();
    if (getIsMongo()) {
      // Handle Sequelize-style { where: { ... } } or direct filter
      const filter = where.where || where;
      return UserModel.findOne(filter);
    }
    return UserModel.findOne({ where });
  }
};
