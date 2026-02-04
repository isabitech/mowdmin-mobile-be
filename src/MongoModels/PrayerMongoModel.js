import mongoose from 'mongoose';

const PrayerMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  isPublic: { type: Boolean, default: true },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  prayerRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrayerRequestMongo',
    required: false,
  },
}, {
  timestamps: true,
  collection: 'prayers',
});

export default mongoose.model('PrayerMongo', PrayerMongoSchema);
