// DonationController.js
import DonationService from "../Services/DonationService.js";
import PaymentService from "../Services/PaymentService.js";
import { sendSuccess, sendError } from "../core/response.js";

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
    if (!donation) {
      return sendError(res, { message: "Donation not found", statusCode: 404 });
    }
    // Verify ownership unless admin
    const donationUserId = donation.userId?._id || donation.userId;
    const requestUserId = req.user?._id || req.user?.id;
    if (!req.user?.isAdmin && donationUserId && donationUserId.toString() !== requestUserId.toString()) {
      return sendError(res, { message: "You do not have permission to view this donation", statusCode: 403 });
    }
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

  async payForDonation(req, res) {
    const donationId = req.params.id;
    const userId = req.user?._id || req.user?.id;

    // Fetch the donation and validate
    const donation = await DonationService.getDonationById(donationId);
    if (!donation) {
      return sendError(res, { message: "Donation not found", statusCode: 404 });
    }

    // Verify ownership
    const donationUserId = donation.userId?._id || donation.userId;
    if (donationUserId && donationUserId.toString() !== userId.toString()) {
      return sendError(res, { message: "You do not have permission to perform this action", statusCode: 403 });
    }

    if (donation.status !== 'pending') {
      return sendError(res, { message: `Cannot pay for a donation with status '${donation.status}'`, statusCode: 400 });
    }

    // Parse the amount (may be Decimal128)
    const amount = parseFloat(donation.amount.toString());
    if (!amount || amount <= 0) {
      return sendError(res, { message: "Donation has an invalid amount", statusCode: 400 });
    }

    // Get campaignId from the donation
    const campaignId = donation.campaign?._id || donation.campaign;

    // Create a Stripe PaymentIntent linked to this donation
    const paymentResult = await PaymentService.createPaymentIntent(
      userId,
      amount,
      donation.currency || 'USD',
      'donation',
      {
        donationId: donationId.toString(),
        campaignId: campaignId.toString(),
      }
    );

    return sendSuccess(res, {
      message: "Payment intent created for donation",
      data: paymentResult,
      statusCode: 201,
    });
  }
}

export default new DonationController();
