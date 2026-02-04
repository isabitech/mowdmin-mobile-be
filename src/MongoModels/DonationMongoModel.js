import mongoose from 'mongoose';

const DonationMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  campaign: {
    type: String,
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  transactionRef: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
}, {
  timestamps: true,
  collection: 'donations',
});

export default mongoose.model('DonationMongo', DonationMongoSchema);
