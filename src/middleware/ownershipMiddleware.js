import { AppError } from "../Utils/AppError.js";
import { OrderRepository } from "../repositories/OrderRepository.js";
import { PaymentRepository } from "../repositories/PaymentRepository.js";
import { PrayerRequestRepository } from "../repositories/PrayerRequestRepository.js";

/**
 * Middleware to verify ownership of a resource.
 * @param {string} resourceType - 'Order', 'Payment', or 'PrayerRequest'
 * @param {string} paramName - Parameter name to read from req.params (default: 'id')
 */
export const checkOwnership = (resourceType, paramName = "id") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const userId = req.user.id;
      let resource;

      switch (resourceType) {
        case "Order":
          resource = await OrderRepository.findById(resourceId);
          break;
        case "Payment":
          resource = await PaymentRepository.findById(resourceId);
          break;
        case "PrayerRequest":
          resource = await PrayerRequestRepository.findById(resourceId);
          break;
        default:
          return next(new AppError("Request failed", 500));
      }

      if (!resource) {
        // Return 404/403 without leaking information
        return next(new AppError("Forbidden", 403));
      }

      // Check if user owns the resource
      // Note: handle both unpopulated IDs and populated objects
      const rawOwnerId = resource.userId || resource.user_id;
      const ownerId =
        rawOwnerId && typeof rawOwnerId === "object"
          ? rawOwnerId._id || rawOwnerId.id || rawOwnerId
          : rawOwnerId;

      if (ownerId && ownerId.toString() !== userId.toString()) {
        console.log(
          `Ownership Denied: Resource Owner ${ownerId} vs Requester ${userId}`,
        );
        return next(new AppError("Forbidden", 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
