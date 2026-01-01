import { Router } from "express";
import PaymentController from "../Controllers/PaymentController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { validateCreatePayment, validateUpdatePayment } from "../validators/paymentValidators.js";
import { handleValidationErrors } from "../middleware/Validation/handleValidationErrors.js";

const payment = Router();

payment.post(
	"/",
	protectUser,
	validateCreatePayment,
	handleValidationErrors,
	tryCatch(PaymentController.create)
);
payment.get("/", protectUser, tryCatch(PaymentController.getAll));
payment.get("/order/:orderId", protectUser, tryCatch(PaymentController.getByOrder));
payment.get("/:id", protectUser, tryCatch(PaymentController.getOne));
payment.put(
	"/:id",
	protectUser,
	validateUpdatePayment,
	handleValidationErrors,
	tryCatch(PaymentController.update)
);
payment.delete("/:id", protectUser, tryCatch(PaymentController.delete));

export default payment;
