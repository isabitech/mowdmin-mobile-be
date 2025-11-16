import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js"; // your sequelize instance
import User from "./UserModel.js";
import OrderItem from "./OrderItemModel.js"; // you’ll create this next
import Payment from "./PaymentModel.js"; // link to payments

const Order = getSequelize().define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "USD",
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "failed", "cancelled", "delivered"),
      defaultValue: "pending",
    },
    payment_reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

async () => {
  // --- Associations ---
  Order.belongsTo(User, { foreignKey: "userId", as: "user" });
  Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
  Order.hasOne(Payment, { foreignKey: "orderId", as: "payment" });

}


export default Order;
