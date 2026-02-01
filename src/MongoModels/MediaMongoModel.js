import mongoose from 'mongoose';

const MediaMongoSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaCategoryMongo',
  },
  url: {
    type: String,
  },
  thumbnail: {
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
