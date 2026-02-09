// DonationService.js
import { DonationRepository } from "../repositories/DonationRepository.js";


export const createDonation = async (dto) => {
  return DonationRepository.create(dto);
};

export const getDonations = async (filters, pagination) => {
  return DonationRepository.findAll(filters, pagination);
};

export const getDonationById = async (id) => {
  return DonationRepository.findById(id);
};

export const getDonationsByUserId = async (userId, pagination) => {
  return DonationRepository.findAllByUserId(userId, pagination);
};

export const getAllDonations = getDonations; // Alias for tests

export default {
  createDonation,
  getDonations,
  getDonationById,
  getDonationsByUserId,
  getAllDonations,
};