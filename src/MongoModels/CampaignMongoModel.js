import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    goalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    totalRaised: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "campaigns",
  },
);

CampaignSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model("Campaign", CampaignSchema);
