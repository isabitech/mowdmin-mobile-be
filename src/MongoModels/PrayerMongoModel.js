import mongoose from 'mongoose';

const PrayerMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  content: { type: String, required: true },
  isPublic: { type: Boolean, default: true },
}, {
  timestamps: true,
  collection: 'prayers',
});

export default mongoose.model('PrayerMongo', PrayerMongoSchema);
