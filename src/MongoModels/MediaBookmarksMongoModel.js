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

MediaBookmarksMongoSchema.index({ userId: 1 });
MediaBookmarksMongoSchema.index({ userId: 1, mediaId: 1 });

export default mongoose.model('MediaBookmarksMongo', MediaBookmarksMongoSchema);
