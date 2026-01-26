import { Router } from "express";
import PaymentController from "../Controllers/PaymentController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { middlewareValidateCreatePayment, middlewareValidateUpdatePayment } from "../validators/paymentValidators.js";
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
payment.get("/", protectUser, tryCatch(PaymentController.getAll));
payment.get("/order/:orderId", protectUser, tryCatch(PaymentController.getByOrder));
payment.get("/:id", protectUser, tryCatch(PaymentController.getOne));
payment.put(
	"/:id",
	protectUser,
	middlewareValidateUpdatePayment,
	handleValidationErrors,
	tryCatch(PaymentController.update)
);
payment.delete("/:id", protectUser, tryCatch(PaymentController.delete));

export default payment;
