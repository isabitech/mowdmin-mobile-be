import Stripe from "stripe";
import mongoose from "mongoose";
import { PaymentRepository } from "../repositories/PaymentRepository.js";
import { OrderRepository } from "../repositories/OrderRepository.js";
import CampaignService from "./CampaignService.js";
import { AppError } from "../core/error.js";
import { withTimeout } from "../Utils/withTimeout.js";
import PaymentModel from "../MongoModels/PaymentMongoModel.js";
import OrderModel from "../MongoModels/OrderMongoModel.js";
import CampaignModel from "../MongoModels/CampaignMongoModel.js";
import DonationModel from "../MongoModels/DonationMongoModel.js";
import DonationRepository from "../repositories/DonationRepository.js";
import CampaignRepository from "../repositories/CampaignRepository.js";

// Initialize Stripe instance - fail fast if not configured
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey && process.env.NODE_ENV === "production") {
  console.error("FATAL: STRIPE_SECRET_KEY is not set in production");
}
const stripe = new Stripe(stripeKey || "sk_test_placeholder", {
  apiVersion: "2023-10-16",
});

class PaymentService {
  /**
   * Creates a PaymentIntent with Stripe and saves a pending Payment in DB
   */
  async createPaymentIntent(userId, amount, currency, type, metadata = {}) {
    // 1. Strict Server-side validation
    if (!amount || amount <= 0) {
      throw new AppError("Invalid payment amount", 400);
    }

    if (!["order", "donation", "subscription"].includes(type)) {
      throw new AppError("Invalid payment type", 400);
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new AppError("Payment service unavailable", 500);
    }

    // Convert amount to cents for Stripe (assuming amount is passed in standard currency units)
    const amountInCents = Math.round(amount * 100);

    // 2. Create PaymentIntent
    const paymentIntent = await withTimeout(
      stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata: {
          userId: userId.toString(),
          type,
          ...metadata,
        },
      }),
      8000,
      "Stripe payment intent request",
    );

    // 3. Save pending payment record
    const transactionRef = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Set expiration to 24 hours from now for pending payments
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const paymentRecord = await PaymentRepository.createPayment({
      userId,
      amount,
      currency: currency.toUpperCase(),
      type,
      status: "pending",
      transactionRef,
      paymentIntentId: paymentIntent.id,
      metadata,
      expiresAt,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentRecord._id || paymentRecord.id, // Support mongoose/sequelize
      transactionRef,
      expiresAt,
    };
  }

  /**
   * Main Webhook Handler
   */
  async handleStripeWebhook(signature, rawBody) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new AppError("Payment service unavailable", 500);
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message);
      throw new AppError("Webhook Error", 400);
    }

    // Process the event
    console.log(
      `[Stripe Webhook] Received event: ${event.type} [ID: ${event.id}]`,
    );

    // Idempotency Check: Did we process this precise webhook event already?
    const existingProcessedEvent = await PaymentRepository.findByWebhookEventId(
      event.id,
    );
    if (existingProcessedEvent) {
      console.log(
        `[Stripe Webhook] Event ${event.id} already processed. Skipping.`,
      );
      return { received: true, alreadyProcessed: true };
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        await this.handlePaymentSuccess(paymentIntentSucceeded, event.id);
        break;

      case "payment_intent.payment_failed":
        const paymentIntentFailed = event.data.object;
        await this.handlePaymentFailure(paymentIntentFailed, event.id);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  async handlePaymentSuccess(paymentIntent, webhookEventId) {
    const payment = await PaymentRepository.findByPaymentIntentId(
      paymentIntent.id,
    );
    if (!payment) {
      console.error(
        `[Webhook] No payment record found for Intent ID: ${paymentIntent.id}`,
      );
      return;
    }

    // Double Idempotency Check: Is it already marked successful?
    if (payment.status === "success") {
      console.log(
        `[Webhook] Payment ${payment.transactionRef} already marked successful.`,
      );
      return;
    }

    // If using MongoDB, utilize a transaction for atomic multi-document updates
    if (process.env.DB_CONNECTION === "mongodb") {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          // 1. Update Payment Status
          await PaymentModel.findByIdAndUpdate(
            payment._id || payment.id,
            { status: "success", webhookEventId },
            { session, new: true, runValidators: true },
          );

          // 2. Route Logic
          if (payment.type === "order") {
            await this._processOrderSuccess(payment, session);
          } else if (payment.type === "donation") {
            await this._processDonationSuccess(payment, session);
          }
        });
        console.log(
          `✅ [Webhook] Payment ${payment.transactionRef} marked successful inside transaction.`,
        );
      } catch (err) {
        console.error(
          `❌ [Webhook] Error processing side-effects for payment ${payment.transactionRef}:`,
          err,
        );
        // Throw to let Stripe know things failed hard
        throw new AppError("Payment processing failed", 500);
      } finally {
        await session.endSession();
      }
    } else {
      // Fallback for Non-MongoDB SQL structures
      await PaymentRepository.updatePaymentStatus(payment.id, "success", {
        webhookEventId,
      });
      console.log(
        `✅ [Webhook] Payment ${payment.transactionRef} marked successful (No DB Transaction).`,
      );

      try {
        if (payment.type === "order") {
          await this._processOrderSuccess(payment);
        } else if (payment.type === "donation") {
          await this._processDonationSuccess(payment);
        }
      } catch (err) {
        console.error(
          `❌ [Webhook] Error processing side-effects for payment ${payment.transactionRef}:`,
          err,
        );
      }
    }
  }

  /**
   * Handle failed Payment Intent
   */
  async handlePaymentFailure(paymentIntent, webhookEventId) {
    const payment = await PaymentRepository.findByPaymentIntentId(
      paymentIntent.id,
    );
    if (!payment) return;

    if (payment.status === "failed") return; // Idempotent check

    await PaymentRepository.updatePaymentStatus(
      payment._id || payment.id,
      "failed",
      { webhookEventId },
    );
    console.log(
      `❌ [Webhook] Payment ${payment.transactionRef} marked failed.`,
    );

    // Route fail logic
    await this._processFailureSideEffects(payment);
  }

  // --- Private Side-Effect Business Logic Handlers ---

  async _processOrderSuccess(payment, session = null) {
    const orderId = payment.metadata?.orderId;
    if (!orderId) return;

    if (process.env.DB_CONNECTION === "mongodb") {
      await OrderModel.findByIdAndUpdate(
        orderId,
        { status: "paid" },
        { session, new: true },
      );
      console.log(
        `✅ [Webhook] Order ${orderId} marked as paid in transaction.`,
      );
    } else {
      const order = await OrderRepository.findById(orderId);
      if (order) {
        order.status = "paid";
        await order.save();
        console.log(`✅ [Webhook] Order ${orderId} marked as paid.`);
      }
    }
  }

  async _processDonationSuccess(payment, session = null) {
    const campaignId = payment.metadata?.campaignId;
    const donationId = payment.metadata?.donationId;
    if (!campaignId) return;

    const amountDecimal = parseFloat(payment.amount.toString());

    if (process.env.DB_CONNECTION === "mongodb") {
      // Atomic update for Campaign
      await CampaignModel.findByIdAndUpdate(
        campaignId,
        { $inc: { totalRaised: amountDecimal } },
        { session, new: true },
      );
      console.log(
        `✅ [Webhook] Campaign ${campaignId} incremented by ${amountDecimal}.`,
      );

      if (donationId) {
        await DonationModel.findByIdAndUpdate(
          donationId,
          { status: "success" },
          { session, new: true },
        );
      }
    } else {
      const campaign = await CampaignRepository.getCampaignById(campaignId);
      if (campaign) {
        const currentTotal = campaign.totalRaised || 0;
        const nextTotal = parseFloat(currentTotal.toString()) + amountDecimal;
        await CampaignRepository.updateCampaign(campaignId, {
          totalRaised: nextTotal,
        });
      }

      if (donationId) {
        await DonationRepository.updateDonationStatus(donationId, "success");
      }
    }
  }

  async _processFailureSideEffects(payment) {
    if (payment.type === "donation" && payment.metadata?.donationId) {
      await DonationRepository.updateDonationStatus(
        payment.metadata.donationId,
        "failed",
      );
    }
  }

  // --- Admin / Standard Fetch Methods ---

  async getAllPayments(filters) {
    return PaymentRepository.getAllPaymentsWithPagination(filters);
  }

  async getPaymentById(id) {
    const payment = await PaymentRepository.getPaymentById(id);
    if (!payment) {
      throw new AppError("Resource not found", 404);
    }
    return payment;
  }

  /**
   * Optional Cleanup Job: Marks all pending payments past expiresAt as 'failed'.
   * Intended to be run via a Cron job (e.g. node-cron) periodically.
   */
  async expirePendingPayments() {
    if (process.env.DB_CONNECTION === "mongodb") {
      const now = new Date();

      const result = await PaymentModel.updateMany(
        { status: "pending", expiresAt: { $lte: now } },
        { $set: { status: "failed" } },
      );

      if (result.modifiedCount > 0) {
        console.log(
          `[Job: Expire Payments] Marked ${result.modifiedCount} pending payments as failed.`,
        );
      }
    }
    // If SQL, add equivalent batched raw query here.
  }
}

export default new PaymentService();
