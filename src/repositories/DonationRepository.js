// DonationRepository.js
let DonationModel;
let UserModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const DonationRepository = {
  async getModels() {
    if (!DonationModel || (!isMongo && !UserModel)) {
      if (isMongo) {
        DonationModel = (await import('../MongoModels/DonationMongoModel.js')).default;
        // Mongo usually handles relations differently (e.g. populate), but we load it anyway if needed for consistency or future manual populations
        UserModel = (await import('../MongoModels/UserMongoModel.js')).default;
      } else {
        DonationModel = (await import('../Models/DonationModel.js')).default;
        UserModel = (await import('../Models/UserModel.js')).default;
      }
    }
    return { DonationModel, UserModel };
  },

  async create(dto) {
    const { DonationModel } = await this.getModels();
    return DonationModel.create(dto);
  },

  isValidId(id) {
    if (!isMongo) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },

  async findById(id) {
    const { DonationModel } = await this.getModels();
    if (isMongo) {
      if (!this.isValidId(id)) return null;
      return DonationModel.findById(id).populate('userId', 'name email');
    } else {
      return DonationModel.findByPk(id, {
        include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }]
      });
    }
  },

  async findAll(filters = {}, pagination = { page: 1, limit: 10 }) {
    const { DonationModel, UserModel } = await this.getModels();
    const { page, limit } = pagination;

    // Handle MongoDB filters (convert userId string to ObjectId if present)
    const processedFilters = { ...filters };
    if (isMongo && processedFilters.userId && typeof processedFilters.userId === 'string') {
      if (mongoose.Types.ObjectId.isValid(processedFilters.userId)) {
        processedFilters.userId = new mongoose.Types.ObjectId(processedFilters.userId);
      }
    }

    if (isMongo) {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        DonationModel.find(processedFilters)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email'),
        DonationModel.countDocuments(processedFilters)
      ]);
      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } else {
      const offset = (page - 1) * limit;
      const { rows, count } = await DonationModel.findAndCountAll({
        where: processedFilters,
        offset,
        limit,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
      return {
        data: rows,
        meta: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    }
  },

  async findAllByUserId(userId, pagination = { page: 1, limit: 10 }) {
    return this.findAll({ userId }, pagination);
  }
};

export default DonationRepository;