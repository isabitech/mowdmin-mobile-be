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
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  type: {
    type: String,
    enum: ['Crusade', 'Baptism', 'Communion', 'Concert', 'Seminar', 'Online', 'Tour', 'Convention', 'Conference', 'Symposium'],
    required: true,
  },
  registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventRegistrationMongo' }],
}, {
  timestamps: true,
  collection: 'events',
});

export default mongoose.model('EventMongo', EventMongoSchema);
