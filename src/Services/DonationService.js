// DonationService.js
import { DonationRepository } from "../repositories/DonationRepository.js";


export const createDonation = async (dto) => {
  return DonationRepository.create(dto);
};

export const getDonations = async (filters, pagination) => {
  return DonationRepository.findAll(filters, pagination);
};

export default {
  createDonation,
  getDonations,
};