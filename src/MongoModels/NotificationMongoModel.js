import mongoose from 'mongoose';

const NotificationMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    // Allow all known notification types used across services and validators
    enum: ['info', 'alert', 'reminder', 'system', 'transaction', 'like'],
    default: 'info',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'notifications',
});

export default mongoose.model('NotificationMongo', NotificationMongoSchema);
