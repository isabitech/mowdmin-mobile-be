import mongoose from 'mongoose';

const NotificationMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.UUID,
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
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'notifications',
});

export default mongoose.model('NotificationMongo', NotificationMongoSchema);
