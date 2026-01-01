// DonationRepository.js
let DonationModel;
const isMongo = process.env.DB_CONNECTION === 'mongodb';

export class DonationRepository {
  static async getModel() {
    if (!DonationModel) {
      if (isMongo) {
        DonationModel = (await import('../MongoModels/DonationMongoModel.js')).default;
      } else {
        DonationModel = (await import('../Models/DonationModel.js')).default;
      }
    }
    return DonationModel;
  }

  static async create(dto) {
    const Model = await this.getModel();
    return isMongo ? Model.create(dto) : Model.create(dto);
  }

  static async findAll(filters = {}, pagination = { page: 1, limit: 10 }) {
    const Model = await this.getModel();
    const { page, limit } = pagination;
    if (isMongo) {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        Model.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Model.countDocuments(filters)
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
      const { rows, count } = await Model.findAndCountAll({
        where: filters,
        offset,
        limit,
        order: [['createdAt', 'DESC']]
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
}

export default DonationRepository;