import mongoose from "mongoose";

const NotificationDeviceMongoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserMongo",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ["android", "ios", "web"],
      required: true,
    },
    deviceName: {
      type: String,
      default: null,
    },
    appVersion: {
      type: String,
      default: null,
    },
    locale: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "notification_devices",
  },
);

NotificationDeviceMongoSchema.index({ userId: 1, isActive: 1, updatedAt: -1 });

export default mongoose.model(
  "NotificationDeviceMongo",
  NotificationDeviceMongoSchema,
);
