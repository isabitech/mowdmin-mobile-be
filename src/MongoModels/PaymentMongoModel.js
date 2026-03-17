import mongoose from "mongoose";

const PaymentMongoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserMongo",
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "donation", "subscription"],
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    transactionRef: {
      type: String,
      required: true,
      unique: true,
    },
    paymentIntentId: {
      type: String,
      index: true,
    },
    webhookEventId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/missing values but enforces uniqueness when present
    },
    method: {
      type: String,
      default: "stripe",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      // Optional: Mongoose TTL index to auto-delete or a cron job could use this to mark as failed
      // expires: 0 // Uncomment to auto-delete documents
    },
  },
  {
    timestamps: true,
    collection: "payments",
  },
);

// Optionally, you can add an index if you plan to write a cron job that finds expired payments
PaymentMongoSchema.index({ status: 1, expiresAt: 1 });
PaymentMongoSchema.index({ status: 1, createdAt: -1 });
PaymentMongoSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model("PaymentMongo", PaymentMongoSchema);
