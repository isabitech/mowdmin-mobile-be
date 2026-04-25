import mongoose from "mongoose";

const MediaMongoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaCategoryMongo",
    },
    type: {
      type: String,
      enum: ["audio", "video", "text"],
    },
    media_url: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    author: {
      type: String,
    },
    duration: {
      type: String,
    },
    is_downloadable: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
    },
    youtubeLiveLink: {
      type: String,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "media",
  },
);

MediaMongoSchema.index({ category_id: 1 });
MediaMongoSchema.index({ type: 1 });
MediaMongoSchema.index({ isLive: 1 });
MediaMongoSchema.index({ createdAt: -1 });
MediaMongoSchema.index({ category_id: 1, type: 1 });

export default mongoose.model("MediaMongo", MediaMongoSchema);
