// MembershipController.js
import membershipService from '../Services/MembershipService.js';
import { sendSuccess } from '../core/response.js';


class MembershipController {
  async registerMembership(req, res, next) {
     const dto = req.body; // Add validation as needed
    const result = await membershipService.registerMembership(dto);
    return sendSuccess(res, { message: "Membership registered successfully", data: result });
  }
  async getMemberships(req, res, next) {
    const memberships = await membershipService.getMemberships(req.query);
    return sendSuccess(res, { message: "Memberships fetched successfully", data: memberships });
  }
}
 export default new MembershipController();




