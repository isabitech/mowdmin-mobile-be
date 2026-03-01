import PaymentService from "../Services/PaymentService.js";
import { sendSuccess, sendError } from "../core/response.js";
// Optional: import validation schemas for the new payload structure

class PaymentController {
  async createIntent(req, res) {
    // Basic validation could be moved to standard middleware
    const { amount, currency = 'USD', type, metadata } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, { message: "Amount must be greater than 0", statusCode: 400 });
    }

    if (!['order', 'donation', 'subscription'].includes(type)) {
      return sendError(res, { message: "Invalid payment type", statusCode: 400 });
    }

    const userId = req.user._id || req.user.id;

    const result = await PaymentService.createPaymentIntent(userId, amount, currency, type, metadata);

    return sendSuccess(res, { message: "Payment Intent Created Successfully", data: result, statusCode: 201 });
  }

  async getAll(req, res) {
    const filters = req.query;
    const payments = await PaymentService.getAllPayments(filters);
    return sendSuccess(res, { message: "Payments Fetched Successfully", data: payments });
  }

  async getOne(req, res) {
    const payment = await PaymentService.getPaymentById(req.params.id);
    return sendSuccess(res, { message: "Payment Fetched Successfully", data: payment });
  }

  // Admin Override Route
  async updateStatus(req, res) {
    const { status } = req.body;
    if (!['pending', 'success', 'failed', 'refunded'].includes(status)) {
      return sendError(res, { message: "Invalid status", statusCode: 400 });
    }

    // In a real scenario, updating status manually might require triggering side-effects too.
    // For simplicity, we assume this is just an admin override for the record.
    const PaymentRepository = (await import("../repositories/PaymentRepository.js")).default;
    const payment = await PaymentRepository.updatePaymentStatus(req.params.id, status);

    if (!payment) {
      return sendError(res, { message: "Payment not found", statusCode: 404 });
    }

    return sendSuccess(res, { message: "Payment Status Updated Successfully", data: payment });
  }

  async handleWebhook(req, res) {
    const signature = req.headers['stripe-signature'];

    // Note: req.body MUST be the raw buffer here. This requires specific routing middleware in Express.
    const rawBody = req.body;

    try {
      await PaymentService.handleStripeWebhook(signature, rawBody);
      return res.status(200).send({ received: true });
    } catch (err) {
      console.error(`Webhook Error:`, err.message);
      // Stripe needs a 400 to know it failed and should potentially retry (if it's a 500) or report.
      // Returning 400 because if our signature verification fails, it's a bad request.
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}

export default new PaymentController();
