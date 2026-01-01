import mongoose from 'mongoose';

const OrderItemMongoSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderMongo',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductMongo',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
}, {
  timestamps: true,
  collection: 'order_items',
});

export default mongoose.model('OrderItemMongo', OrderItemMongoSchema);
