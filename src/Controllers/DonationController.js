// DonationController.js
import DonationService from "../Services/DonationService.js";
import { sendSuccess } from "../core/response.js";

class DonationController {
  async create(req, res, next) {
    // Assuming req.user is set by authMiddleware
    const userId = req.user?._id || req.user?.id;
    const payload = { ...req.body, userId };

    const donation = await DonationService.createDonation(payload);
    return sendSuccess(res, {
      message: "Donation created successfully",
      data: donation,
      statusCode: 201,
    });
  }

  async getAll(req, res, next) {
    const filters = req.query;
    const result = await DonationService.getAllDonationsWithPagination(filters);
    return sendSuccess(res, {
      message: "Donations fetched successfully",
      data: result,
    });
  }

  async getOne(req, res, next) {
    const donation = await DonationService.getDonationById(req.params.id);
    return sendSuccess(res, {
      message: "Donation fetched successfully",
      data: donation,
    });
  }

  async updateStatus(req, res, next) {
    const { status, paymentVerificationData } = req.body;
    const donation = await DonationService.updateDonationStatus(req.params.id, status, paymentVerificationData);

    return sendSuccess(res, {
      message: `Donation status updated to ${status}`,
      data: donation,
    });
  }

  async getByCampaign(req, res, next) {
    const donations = await DonationService.getDonationsByCampaign(req.params.campaignId);
    return sendSuccess(res, {
      message: "Campaign donations fetched successfully",
      data: donations,
    });
  }
}

export default new DonationController();
