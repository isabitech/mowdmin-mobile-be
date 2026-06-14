import mongoose from "mongoose";

const NotificationDispatchLogMongoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserMongo",
      required: true,
    },
    referenceKey: {
      type: String,
      required: true,
      trim: true,
    },
    pushSent: {
      type: Boolean,
      default: false,
    },
    inAppCreated: {
      type: Boolean,
      default: false,
    },
    lastSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "notification_dispatch_logs",
  },
);

NotificationDispatchLogMongoSchema.index(
  { userId: 1, referenceKey: 1 },
  { unique: true },
);

export default mongoose.model(
  "NotificationDispatchLogMongo",
  NotificationDispatchLogMongoSchema,
);
