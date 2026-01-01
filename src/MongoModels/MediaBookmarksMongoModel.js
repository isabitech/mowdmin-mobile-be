import mongoose from 'mongoose';

const MediaBookmarksMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaMongo',
    required: true,
  },
  note: {
    type: String,
  },
}, {
  timestamps: true,
  collection: 'media_bookmarks',
});

export default mongoose.model('MediaBookmarksMongo', MediaBookmarksMongoSchema);
