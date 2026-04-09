// DonationService.js
import DonationRepository from "../repositories/DonationRepository.js";
import CampaignService from "./CampaignService.js";
import { AppError } from "../core/error.js";

class DonationService {
  async createDonation(data) {
    const { campaign: campaignId } = data;

    // Validate campaign is active before donating
    const campaign = await CampaignService.getCampaignById(campaignId);
    if (!campaign.isActive) {
      throw new AppError("Cannot process donation", 400);
    }

    return await DonationRepository.createDonation(data);
  }

  async getDonationById(id) {
    const donation = await DonationRepository.getDonationById(id);
    if (!donation) {
      throw new AppError("Resource not found", 404);
    }
    return donation;
  }

  async getAllDonationsWithPagination(query) {
    return await DonationRepository.getAllDonationsWithPagination(query);
  }

  async updateDonationStatus(id, status, paymentVerificationData = null) {
    const donation = await this.getDonationById(id);

    // Cannot mark failed donation as success without payment verification
    if (donation.status === "failed" && status === "success") {
      if (!paymentVerificationData || !paymentVerificationData.verified) {
        throw new AppError("Cannot update donation status", 400);
      }
    }

    // Only increment totalRaised if transitioning from a non-success state to success
    const isBecomingSuccess =
      donation.status !== "success" && status === "success";

    const updatedDonation = await DonationRepository.updateDonationStatus(
      id,
      status,
    );

    if (isBecomingSuccess) {
      const campaign = await CampaignService.getCampaignById(
        donation.campaign._id || donation.campaign.id,
      );

      // We parse amounts carefully since amount might be a Decimal128 object depending on DB/Mongoose implementation
      const donationAmount = updatedDonation.amount
        ? parseFloat(updatedDonation.amount.toString())
        : 0;
      const currentTotal = campaign.totalRaised || 0;

      await CampaignService.updateCampaign(campaign._id || campaign.id, {
        totalRaised: currentTotal + donationAmount,
      });
    }

    return updatedDonation;
  }

  async getDonationsByCampaign(campaignId, pagination = {}) {
    return await DonationRepository.getDonationsByCampaign(
      campaignId,
      pagination,
    );
  }
}

export default new DonationService();
