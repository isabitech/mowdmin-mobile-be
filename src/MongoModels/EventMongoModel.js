import mongoose from 'mongoose';

const EventMongoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Crusade', 'Baptism', 'Communion', 'Concert'],
    required: true,
  },
  registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventRegistrationMongo' }],
}, {
  timestamps: true,
  collection: 'events',
});

export default mongoose.model('EventMongo', EventMongoSchema);
