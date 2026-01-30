import { Router } from "express";
import PaymentController from "../Controllers/PaymentController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import { checkOwnership } from "../middleware/ownershipMiddleware.js";
import { middlewareValidateCreatePayment, middlewareValidateUpdatePayment } from "../middleware/Validation/paymentValidation.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";
import { tryCatch } from "../Utils/try-catch.js";

const payment = Router();

payment.post(
	"/create",
	protectUser,
	middlewareValidateCreatePayment,
	handleValidationErrors,
	tryCatch(PaymentController.create)
);
// REMOVED: GET /payment/ - Admin-only access should be via separate admin endpoint
payment.get("/", protectUser, protectAdmin, tryCatch(PaymentController.getAll));
payment.get("/order/:orderId", protectUser, checkOwnership('Order', 'orderId'), tryCatch(PaymentController.getByOrder));
payment.get("/:id", protectUser, checkOwnership('Payment'), tryCatch(PaymentController.getOne));
payment.put(
	"/:id",
	protectUser,
	checkOwnership('Payment'),
	middlewareValidateUpdatePayment,
	handleValidationErrors,
	tryCatch(PaymentController.update)
);
payment.delete("/:id", protectUser, checkOwnership('Payment'), tryCatch(PaymentController.delete));

export default payment;
