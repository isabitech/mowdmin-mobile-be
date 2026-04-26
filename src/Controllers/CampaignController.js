import CampaignService from "../Services/CampaignService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { paginate } from "../Utils/helper.js";
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
    const { page, limit: pageSize, ...filters } = req.query;
    const hasPagination = page !== undefined || pageSize !== undefined;
    const pagination = hasPagination ? paginate(page || 1, pageSize) : null;

    let data;
    let meta = {};

    if (hasPagination) {
      const { items, total } = await CampaignService.getAllCampaignsWithCount(
        filters,
        pagination,
      );
      data = items;
      const pageNum = Number.parseInt(page || 1, 10);
      const limitNum = pagination?.limit;
      meta = {
        totalItems: total,
        totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
        currentPage: pageNum,
        pageSize: limitNum,
      };
    } else {
      data = await CampaignService.getAllCampaigns(filters, pagination);
    }
    return sendSuccess(res, {
      message: "Campaigns fetched successfully",
      data,
      meta,
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
    const campaign = await CampaignService.updateCampaign(
      req.params.id,
      req.body,
    );
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
