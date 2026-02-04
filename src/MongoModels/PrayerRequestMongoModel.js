import mongoose from 'mongoose';

const PrayerRequestMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: false }, // Made optional for backward compatibility
  images: [{ type: String }],
  isPublic: { type: Boolean, default: false },
}, {
  timestamps: true,
  collection: 'prayer_requests',
});

export default mongoose.model('PrayerRequestMongo', PrayerRequestMongoSchema);
