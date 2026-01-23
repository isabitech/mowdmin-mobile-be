import mongoose from 'mongoose';

const OrderMongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  totalAmount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled', 'shipped', 'completed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
  },
  shippingAddress: {
    type: String,
  },
  notes: {
    type: String,
  },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItemMongo' }],
}, {
  timestamps: true,
  collection: 'orders',
});

export default mongoose.model('OrderMongo', OrderMongoSchema);
