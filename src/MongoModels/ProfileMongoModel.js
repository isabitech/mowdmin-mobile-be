import mongoose from 'mongoose';

const ProfileMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
    unique: true,
  },
  displayName: { type: String },
  photoUrl: { type: String },
  bio: { type: String },
  location: { type: String },
  birthdate: { type: Date },
  language: { type: String, enum: ['EN', 'FR', 'DE'], default: 'EN' },
  notificationPreferences: { type: Object, default: {} },
}, {
  timestamps: true,
  collection: 'profiles',
});

export default mongoose.model('ProfileMongo', ProfileMongoSchema);
