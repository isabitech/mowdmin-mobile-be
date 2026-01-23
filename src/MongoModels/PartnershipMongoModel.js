import mongoose from 'mongoose';

const PartnershipMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  partnershipType: {
    type: String,
    required: true,
  },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active'],
    default: 'pending',
  },
}, {
  timestamps: true,
  collection: 'partnerships',
});

export default mongoose.model('PartnershipMongo', PartnershipMongoSchema);
