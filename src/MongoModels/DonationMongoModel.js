import mongoose from "mongoose";

const DonationMongoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserMongo",
      required: true,
      index: true,
    },

    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },

    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    transactionRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: "donations",
  },
);

DonationMongoSchema.index({ campaign: 1, createdAt: -1 });
DonationMongoSchema.index({ userId: 1, createdAt: -1 });
DonationMongoSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("DonationMongo", DonationMongoSchema);
