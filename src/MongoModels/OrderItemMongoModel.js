import mongoose from "mongoose";

const OrderItemMongoSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderMongo",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductMongo",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    unit_price: {
      type: mongoose.Schema.Types.Decimal128,
      required: false,
    },
    subtotal: {
      type: mongoose.Schema.Types.Decimal128,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "order_items",
  },
);

OrderItemMongoSchema.index({ orderId: 1 });

export default mongoose.model("OrderItemMongo", OrderItemMongoSchema);
