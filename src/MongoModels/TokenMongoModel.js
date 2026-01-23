import mongoose from 'mongoose';

const TokenMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  type: {
    type: String,
    enum: ['refresh', 'reset', 'verify'],
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  revoked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
  collection: 'tokens',
});

export default mongoose.model('TokenMongo', TokenMongoSchema);
