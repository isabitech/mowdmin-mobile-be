// MembershipService.js
import { MembershipRepository } from "../repositories/MembershipRepository.js";


export const createMembership = async (dto) => {
  // Add business logic as needed
  return MembershipRepository.create(dto);
};

export const registerMembership = createMembership; // Alias for controller

export const getMemberships = async (query) => {
  // Add pagination/filtering as needed
  return MembershipRepository.findAll(query || {});
};

export default {
  createMembership,
  registerMembership,
  getMemberships,
};