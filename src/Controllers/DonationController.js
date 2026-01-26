// DonationController.js
import donationService from "../Services/DonationService.js";
import { sendSuccess } from "../core/response.js";

class DonationController {
  async create(req, res, next) {
    const dto = req.body; // Add validation as needed
    const result = await donationService.createDonation(dto);
    return sendSuccess(res, {
      message: "Donation created successfully",
      data: result,
      statusCode: 201
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
