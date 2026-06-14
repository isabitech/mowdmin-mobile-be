import mongoose from "mongoose";
import {
  DEFAULT_NOTIFICATION_DELIVERY,
  NOTIFICATION_TYPES,
} from "../Utils/notification.js";

const NotificationMongoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserMongo",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "info",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    delivery: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ ...DEFAULT_NOTIFICATION_DELIVERY }),
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  },
);

NotificationMongoSchema.index({ userId: 1, createdAt: -1 });
NotificationMongoSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model("NotificationMongo", NotificationMongoSchema);
