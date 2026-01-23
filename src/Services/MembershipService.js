// MembershipService.js
import { MembershipRepository } from "../repositories/MembershipRepository.js";


export const registerMembership = async (dto) => {
  // Add business logic as needed
  return MembershipRepository.create(dto);
};

export const getMemberships = async (query) => {
  // Add pagination/filtering as needed
  return MembershipRepository.findAll(query);
};

export default {
  registerMembership,
  getMemberships,
};