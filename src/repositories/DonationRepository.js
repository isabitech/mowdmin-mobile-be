// DonationRepository.js
import mongoose from "mongoose";
let DonationModel;
let UserModel;
let CampaignModel;

const isMongo = process.env.DB_CONNECTION === "mongodb";
const DEFAULT_DONATION_PAGE_SIZE = 20;
const MAX_DONATION_PAGE_SIZE = 100;

export const DonationRepository = {
  async getModels() {
    if (!DonationModel || (!isMongo && !UserModel)) {
      if (isMongo) {
        DonationModel = (await import("../MongoModels/DonationMongoModel.js"))
          .default;
        UserModel = (await import("../MongoModels/UserMongoModel.js")).default;
        CampaignModel = (await import("../MongoModels/CampaignMongoModel.js"))
          .default;
      } else {
        DonationModel = (await import("../Models/DonationModel.js")).default;
        UserModel = (await import("../Models/UserModel.js")).default;
        CampaignModel = (await import("../Models/CampaignModel.js")).default;
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
      return DonationModel.findById(id)
        .populate("userId", "name email")
        .populate("campaign", "title description");
    } else {
      return DonationModel.findByPk(id, {
        include: [
          { model: UserModel, as: "user", attributes: ["id", "name", "email"] },
          {
            model: CampaignModel,
            as: "campaign",
            attributes: ["id", "title", "description"],
          },
        ],
      });
    }
  },

  async getAllDonationsWithPagination({
    search,
    page = 1,
    limit = 10,
    ...filters
  }) {
    const { DonationModel, UserModel, CampaignModel } = await this.getModels();

    // Handle MongoDB filters
    const processedFilters = { ...filters };
    if (
      isMongo &&
      processedFilters.userId &&
      typeof processedFilters.userId === "string"
    ) {
      if (mongoose.Types.ObjectId.isValid(processedFilters.userId)) {
        processedFilters.userId = new mongoose.Types.ObjectId(
          processedFilters.userId,
        );
      }
    }

    if (search) {
      if (isMongo) {
        processedFilters.$or = [
          { transactionRef: { $regex: search, $options: "i" } },
        ];
      } else {
        // Placeholder for SQL Search
        processedFilters.transactionRef = search;
      }
    }

    if (isMongo) {
      const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
      const parsedLimit = Math.max(Number.parseInt(limit, 10) || 10, 1);
      const skip = (parsedPage - 1) * parsedLimit;
      const donations = await DonationModel.find(processedFilters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .populate("userId", "name email")
        .populate("campaign", "title")
        .lean();
      // Keep exact counts for financial records; only skip count on trivial first page.
      const total =
        parsedPage === 1 && donations.length < parsedLimit
          ? donations.length
          : await DonationModel.countDocuments(processedFilters);
      return {
        donations,
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      };
    } else {
      const offset = (page - 1) * limit;
      const { rows, count } = await DonationModel.findAndCountAll({
        where: processedFilters,
        offset,
        limit,
        order: [["createdAt", "DESC"]],
        include: [
          { model: UserModel, as: "user", attributes: ["id", "name", "email"] },
          { model: CampaignModel, as: "campaign", attributes: ["id", "title"] },
        ],
      });
      return {
        donations: rows,
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
      };
    }
  },

  async updateDonationStatus(id, status) {
    const { DonationModel } = await this.getModels();
    if (isMongo) {
      return await DonationModel.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true },
      );
    } else {
      const donation = await DonationModel.findByPk(id);
      if (!donation) return null;
      await donation.update({ status });
      return donation;
    }
  },

  async getDonationsByCampaign(campaignId, pagination = {}) {
    const { DonationModel } = await this.getModels();
    const parsedLimit = Number.parseInt(pagination.limit, 10);
    const parsedOffset = Number.parseInt(pagination.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_DONATION_PAGE_SIZE)
        : DEFAULT_DONATION_PAGE_SIZE;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    if (isMongo) {
      return await DonationModel.find({ campaign: campaignId })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    } else {
      return await DonationModel.findAll({
        where: { campaignId },
        include: [
          { model: UserModel, as: "user", attributes: ["id", "name", "email"] },
        ],
        order: [["createdAt", "DESC"]],
        offset,
        limit,
      });
    }
  },
};

export default DonationRepository;
