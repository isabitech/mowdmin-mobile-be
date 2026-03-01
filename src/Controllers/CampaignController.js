import CampaignService from "../Services/CampaignService.js";
import { sendSuccess, sendError } from "../core/response.js";
// Assuming there is some validation middleware later, but for now we rely on mongoose or basic checks

class CampaignController {
    async create(req, res, next) {
        const campaign = await CampaignService.createCampaign(req.body);
        return sendSuccess(res, {
            message: "Campaign created successfully",
            data: campaign,
            statusCode: 201,
        });
    }

    async getAll(req, res, next) {
        const campaigns = await CampaignService.getAllCampaigns(req.query);
        return sendSuccess(res, {
            message: "Campaigns fetched successfully",
            data: campaigns,
        });
    }

    async getOne(req, res, next) {
        const campaign = await CampaignService.getCampaignById(req.params.id);
        return sendSuccess(res, {
            message: "Campaign fetched successfully",
            data: campaign,
        });
    }

    async update(req, res, next) {
        const campaign = await CampaignService.updateCampaign(req.params.id, req.body);
        return sendSuccess(res, {
            message: "Campaign updated successfully",
            data: campaign,
        });
    }

    async delete(req, res, next) {
        await CampaignService.deleteCampaign(req.params.id);
        return sendSuccess(res, {
            message: "Campaign deleted successfully",
            data: null,
        });
    }
}

export default new CampaignController();
