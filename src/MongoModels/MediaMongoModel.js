import mongoose from 'mongoose';

const MediaMongoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaCategoryMongo',
    required: true,
  },
  type: {
    type: String,
    enum: ["audio", "video", "text"],
    required: true,
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
}, {
  timestamps: true,
  collection: 'media',
});

export default mongoose.model('MediaMongo', MediaMongoSchema);
