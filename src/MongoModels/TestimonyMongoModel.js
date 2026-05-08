import mongoose from "mongoose";

const TestimonyMongoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserMongo",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "testimonies",
  },
);

TestimonyMongoSchema.index({ userId: 1, createdAt: -1 });
TestimonyMongoSchema.index({ isPublic: 1, createdAt: -1 });

export default mongoose.model("TestimonyMongo", TestimonyMongoSchema);
