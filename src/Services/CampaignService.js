import CampaignRepository from "../repositories/CampaignRepository.js";
import { AppError } from "../core/error.js";

class CampaignService {
  async createCampaign(data) {
    return await CampaignRepository.createCampaign(data);
  }

  async getCampaignById(id) {
    const campaign = await CampaignRepository.getCampaignById(id);
    if (!campaign) {
      throw new AppError("Resource not found", 404);
    }
    return campaign;
  }

  async getAllCampaigns(filters = {}, pagination = {}) {
    // Optionally parse filters (e.g., isActive)
    const query = {};
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === "true" || filters.isActive === true;
    }
    return await CampaignRepository.getAllCampaigns(query, pagination);
  }

  async updateCampaign(id, data) {
    const campaign = await CampaignRepository.updateCampaign(id, data);
    if (!campaign) {
      throw new AppError("Resource not found", 404);
    }
    return campaign;
  }

  async deleteCampaign(id) {
    const campaign = await CampaignRepository.deleteCampaign(id);
    if (!campaign) {
      throw new AppError("Resource not found", 404);
    }
    return campaign;
  }
}

export default new CampaignService();
