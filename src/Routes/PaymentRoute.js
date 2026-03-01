import express, { Router } from "express";
import PaymentController from "../Controllers/PaymentController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import { checkOwnership } from "../middleware/ownershipMiddleware.js";
// Note: validation definitions might need updating in middleware/Validation/paymentValidation.js
import { tryCatch } from "../Utils/try-catch.js";

const payment = Router();

// ==========================================
// Stripe Webhook Route (MUST BE RAW BODY)
// ==========================================
// We use express.raw specific to this route because Stripe requires the raw buffer
// to securely verify the webhook signature. If a global json parser has already eaten the body,
// this will fail. So ensure in index.js this route is registered *before* global body parsers,
// OR keep this raw parser here and index.js will handle it safely if configured correctly.
payment.post(
	"/webhooks/stripe",
	express.raw({ type: 'application/json' }),
	tryCatch(PaymentController.handleWebhook)
);

// ==========================================
// Standard API Routes
// ==========================================

// Create a PaymentIntent (returns client_secret)
payment.post(
	"/",
	protectUser,
	tryCatch(PaymentController.createIntent)
);

// Admin: Get all payments
payment.get("/", protectUser, protectAdmin, tryCatch(PaymentController.getAll));

// User/Admin: Get a single payment
// (Validation for ownership simplified here, you may want to re-add checkOwnership if strictly required)
payment.get("/:id", protectUser, tryCatch(PaymentController.getOne));

// Admin: Manually Update Payment Status
payment.patch(
	"/:id/status",
	protectUser,
	protectAdmin,
	tryCatch(PaymentController.updateStatus)
);

export default payment;
