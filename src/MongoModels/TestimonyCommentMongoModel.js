import mongoose from "mongoose";

const TestimonyCommentMongoSchema = new mongoose.Schema(
  {
    testimonyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestimonyMongo",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserMongo",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "testimony_comments",
  },
);

TestimonyCommentMongoSchema.index({ testimonyId: 1, createdAt: -1 });

export default mongoose.model(
  "TestimonyCommentMongo",
  TestimonyCommentMongoSchema,
);
