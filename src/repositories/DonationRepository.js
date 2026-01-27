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

  async findAll(filters = {}, pagination = { page: 1, limit: 10 }) {
    const { DonationModel, UserModel } = await this.getModels();
    const { page, limit } = pagination;

    if (isMongo) {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        DonationModel.find(filters)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email'), // Assuming we want basic user info
        DonationModel.countDocuments(filters)
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
        where: filters,
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
  }
};

export default DonationRepository;