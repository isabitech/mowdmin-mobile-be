import mongoose from 'mongoose';

const MembershipMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  baptismInterest: {
    type: Boolean,
    default: false,
  },
  communionAlert: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active'],
    default: 'pending',
  },
}, {
  timestamps: true,
  collection: 'memberships',
});

export default mongoose.model('MembershipMongo', MembershipMongoSchema);
