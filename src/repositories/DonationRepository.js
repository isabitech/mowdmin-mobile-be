// DonationRepository.js
import mongoose from 'mongoose';
let DonationModel;
let UserModel;
let CampaignModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const DonationRepository = {
  async getModels() {
    if (!DonationModel || (!isMongo && !UserModel)) {
      if (isMongo) {
        DonationModel = (await import('../MongoModels/DonationMongoModel.js')).default;
        UserModel = (await import('../MongoModels/UserMongoModel.js')).default;
        CampaignModel = (await import('../MongoModels/CampaignMongoModel.js')).default;
      } else {
        DonationModel = (await import('../Models/DonationModel.js')).default;
        UserModel = (await import('../Models/UserModel.js')).default;
        CampaignModel = (await import('../Models/CampaignModel.js')).default;
      }
    }
    return { DonationModel, UserModel, CampaignModel };
  },

  async createDonation(dto) {
    const { DonationModel } = await this.getModels();
    return DonationModel.create(dto);
  },

  isValidId(id) {
    if (!isMongo) return true;
    return mongoose.Types.ObjectId.isValid(id);
  },

  async getDonationById(id) {
    const { DonationModel } = await this.getModels();
    if (isMongo) {
      if (!this.isValidId(id)) return null;
      return DonationModel.findById(id).populate('userId', 'name email').populate('campaign', 'title description');
    } else {
      return DonationModel.findByPk(id, {
        include: [
          { model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: CampaignModel, as: 'campaign', attributes: ['id', 'title', 'description'] }
        ]
      });
    }
  },

  async getAllDonationsWithPagination({ search, page = 1, limit = 10, ...filters }) {
    const { DonationModel, UserModel, CampaignModel } = await this.getModels();

    // Handle MongoDB filters
    const processedFilters = { ...filters };
    if (isMongo && processedFilters.userId && typeof processedFilters.userId === 'string') {
      if (mongoose.Types.ObjectId.isValid(processedFilters.userId)) {
        processedFilters.userId = new mongoose.Types.ObjectId(processedFilters.userId);
      }
    }

    if (search) {
      if (isMongo) {
        processedFilters.$or = [
          { transactionRef: { $regex: search, $options: "i" } }
        ]
      } else {
        // Placeholder for SQL Search
        processedFilters.transactionRef = search;
      }
    }

    if (isMongo) {
      const skip = (page - 1) * limit;
      const [donations, total] = await Promise.all([
        DonationModel.find(processedFilters)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .populate('userId', 'name email')
          .populate('campaign', 'title'),
        DonationModel.countDocuments(processedFilters)
      ]);
      return {
        donations,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      };
    } else {
      const offset = (page - 1) * limit;
      const { rows, count } = await DonationModel.findAndCountAll({
        where: processedFilters,
        offset,
        limit,
        order: [['createdAt', 'DESC']],
        include: [
          { model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: CampaignModel, as: 'campaign', attributes: ['id', 'title'] }
        ]
      });
      return {
        donations: rows,
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit)
      };
    }
  },

  async updateDonationStatus(id, status) {
    const { DonationModel } = await this.getModels();
    if (isMongo) {
      return await DonationModel.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );
    } else {
      const donation = await DonationModel.findByPk(id);
      if (!donation) return null;
      await donation.update({ status });
      return donation;
    }
  },

  async getDonationsByCampaign(campaignId) {
    const { DonationModel } = await this.getModels();
    if (isMongo) {
      return await DonationModel.find({ campaign: campaignId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    } else {
      return await DonationModel.findAll({
        where: { campaignId },
        include: [
          { model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']],
      });
    }
  }
};

export default DonationRepository;