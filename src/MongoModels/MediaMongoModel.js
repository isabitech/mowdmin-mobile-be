import mongoose from 'mongoose';

const MediaMongoSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    enum: ['Sermon', 'Album', 'Teaching'],
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
