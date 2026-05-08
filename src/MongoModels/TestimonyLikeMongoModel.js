import mongoose from "mongoose";

const TestimonyLikeMongoSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
    collection: "testimony_likes",
  },
);

TestimonyLikeMongoSchema.index({ testimonyId: 1, userId: 1 }, { unique: true });

export default mongoose.model("TestimonyLikeMongo", TestimonyLikeMongoSchema);
