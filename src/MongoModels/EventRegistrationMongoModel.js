import mongoose from "mongoose";

const EventRegistrationMongoSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventMongo",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserMongo",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "attended"],
      default: "registered",
    },
  },
  {
    timestamps: true,
    collection: "event_registrations",
  },
);

EventRegistrationMongoSchema.index({ eventId: 1, createdAt: -1 });
EventRegistrationMongoSchema.index({ userId: 1, createdAt: -1 });
EventRegistrationMongoSchema.index({ eventId: 1, userId: 1 });

export default mongoose.model(
  "EventRegistrationMongo",
  EventRegistrationMongoSchema,
);
