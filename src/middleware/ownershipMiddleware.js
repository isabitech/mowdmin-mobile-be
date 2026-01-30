import { AppError } from "../Utils/AppError.js";
import { OrderRepository } from "../repositories/OrderRepository.js";
import { PaymentRepository } from "../repositories/PaymentRepository.js";
import { PrayerRequestRepository } from "../repositories/PrayerRequestRepository.js";

/**
 * Middleware to verify ownership of a resource.
 * @param {string} resourceType - 'Order', 'Payment', or 'PrayerRequest'
 * @param {string} paramName - Parameter name to read from req.params (default: 'id')
 */
export const checkOwnership = (resourceType, paramName = 'id') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[paramName];
            const userId = req.user.id;
            let resource;

            switch (resourceType) {
                case 'Order':
                    resource = await OrderRepository.findById(resourceId);
                    break;
                case 'Payment':
                    resource = await PaymentRepository.findById(resourceId);
                    break;
                case 'PrayerRequest':
                    resource = await PrayerRequestRepository.findById(resourceId);
                    break;
                default:
                    return next(new AppError("Invalid resource type for ownership check", 500));
            }

            if (!resource) {
                // Return 404/403 without leaking information
                return next(new AppError("Resource not found or unauthorized", 403));
            }

            // Check if user owns the resource
            // Note: Different models might have different fields (userId, user_id, etc.)
            // Based on repositories, we assume 'userId'
            const ownerId = resource.userId || resource.user_id;

            if (ownerId && ownerId.toString() !== userId.toString()) {
                return next(new AppError("You do not have permission to perform this action", 403));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
