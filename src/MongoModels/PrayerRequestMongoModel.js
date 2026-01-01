import mongoose from 'mongoose';

const PrayerRequestMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: false,
  },
  title: { type: String },
  content: { type: String },
  isPublic: { type: Boolean, default: false },
  prayedCount: { type: Number, default: 0 },
}, {
  timestamps: true,
  collection: 'prayer_requests',
});

export default mongoose.model('PrayerRequestMongo', PrayerRequestMongoSchema);
