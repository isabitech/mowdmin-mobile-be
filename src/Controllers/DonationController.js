// DonationController.js
import donationService from "../Services/DonationService.js";
import { sendSuccess } from "../core/response.js";

class DonationController {
  async create(req, res, next) {
    const dto = { ...req.body, userId: req.user.id };
    const result = await donationService.createDonation(dto);
    return sendSuccess(res, {
      message: "Donation created successfully",
      data: result,
      statusCode: 201
    });
  }

  async getDonationById(req, res, next) {
    const { id } = req.params;
    const donation = await donationService.getDonationById(id);
    if (!donation) {
      return res.status(404).json({ status: 'error', message: 'Donation not found' });
    }
    return sendSuccess(res, {
      message: "Donation fetched successfully",
      data: donation,
    });
  }

  async getDonationsByUser(req, res, next) {
    const { page = 1, limit = 10 } = req.query;
    const pagination = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
    const donations = await donationService.getDonationsByUserId(req.user.id, pagination);
    return sendSuccess(res, {
      message: "Your donations fetched successfully",
      data: donations,
    });
  }

  async getDonations(req, res, next) {
    const { page = 1, limit = 10, ...filters } = req.query;
    const pagination = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
    const donations = await donationService.getDonations(filters, pagination);
    return sendSuccess(res, {
      message: "Donations fetched successfully",
      data: donations,
    });
  }
}

export default new DonationController();
