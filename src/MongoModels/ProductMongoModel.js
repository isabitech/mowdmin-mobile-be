import mongoose from 'mongoose';

const ProductMongoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: mongoose.Schema.Types.Decimal128, required: true },
  category: { type: String },
  imageUrl: { type: String },
  stock: { type: Number, default: 0 },
  stripeProductId: { type: String },
  stripeLink: { type: String },
}, {
  timestamps: true,
  collection: 'products',
});

export default mongoose.model('ProductMongo', ProductMongoSchema);
