import mongoose from 'mongoose';

const EventRegistrationMongoSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventMongo',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  status: {
    type: String,
    enum: ['registered', 'attended'],
    default: 'registered',
  },
}, {
  timestamps: true,
  collection: 'event_registrations',
});

export default mongoose.model('EventRegistrationMongo', EventRegistrationMongoSchema);
