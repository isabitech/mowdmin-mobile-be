import { Router } from "express";
import PaymentController from "../Controllers/PaymentController.js";
import { validatePayment } from "../middleware/Validation/paymentValidation.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const Payment = Router();

//  Create a new payment
Payment.post("/",protectUser, validatePayment, tryCatch(PaymentController.create));

//  Get all payments (admin)
Payment.get("/",protectUser,tryCatch( PaymentController.getAll));

//  Get payment by ID
Payment.get("/:id",protectUser,tryCatch( PaymentController.getOne));

//  Get all payments by order ID
Payment.get("/order/:orderId",protectUser,tryCatch( PaymentController.getByOrder));

//  Update payment info
Payment.put("/:id",protectUser, validatePayment,tryCatch( PaymentController.update));

//  Delete a payment
Payment.delete("/:id",protectUser, tryCatch(PaymentController.delete));

export default Payment;
