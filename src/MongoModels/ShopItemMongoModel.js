import mongoose from 'mongoose';

const ShopItemMongoSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  type: { type: String, enum: ['Book', 'Album'] },
  price: { type: mongoose.Schema.Types.Decimal128 },
  language: { type: String, enum: ['EN', 'FR', 'DE'] },
  stock: { type: Number },
  image: { type: String },
  url: { type: String },
}, {
  timestamps: true,
  collection: 'shop_items',
});

export default mongoose.model('ShopItemMongo', ShopItemMongoSchema);
