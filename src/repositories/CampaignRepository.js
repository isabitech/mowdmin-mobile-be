let CampaignModel;

const isMongo = process.env.DB_CONNECTION === "mongodb";
const DEFAULT_CAMPAIGN_PAGE_SIZE = 20;
const MAX_CAMPAIGN_PAGE_SIZE = 100;

const CampaignRepository = {
  async getModels() {
    if (!CampaignModel) {
      CampaignModel = (
        await import(
          isMongo
            ? "../MongoModels/CampaignMongoModel.js"
            : "../Models/CampaignModel.js"
        )
      ).default;
    }
    return { CampaignModel };
  },

  async createCampaign(data) {
    const { CampaignModel } = await this.getModels();
    return await CampaignModel.create(data);
  },

  async getCampaignById(id) {
    const { CampaignModel } = await this.getModels();
    return isMongo
      ? await CampaignModel.findById(id)
      : await CampaignModel.findByPk(id);
  },

  async getAllCampaigns(query = {}, pagination = {}) {
    const { CampaignModel } = await this.getModels();
    const parsedLimit = Number.parseInt(pagination.limit, 10);
    const parsedOffset = Number.parseInt(pagination.offset, 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_CAMPAIGN_PAGE_SIZE)
        : DEFAULT_CAMPAIGN_PAGE_SIZE;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    if (isMongo) {
      return await CampaignModel.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    } else {
      return await CampaignModel.findAll({
        where: query,
        order: [["createdAt", "DESC"]],
        offset,
        limit,
      });
    }
  },

  async updateCampaign(id, data) {
    const { CampaignModel } = await this.getModels();
    if (isMongo) {
      return await CampaignModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
    } else {
      const campaign = await CampaignModel.findByPk(id);
      if (!campaign) return null;
      return await campaign.update(data);
    }
  },

  async deleteCampaign(id) {
    const { CampaignModel } = await this.getModels();
    if (isMongo) {
      return await CampaignModel.findByIdAndDelete(id);
    } else {
      const campaign = await CampaignModel.findByPk(id);
      if (!campaign) return null;
      await campaign.destroy();
      return true;
    }
  },
};

export default CampaignRepository;
