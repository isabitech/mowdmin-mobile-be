// models/PaymentModel.js
import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";
import Order from "./OrderModel.js";
import User from "./UserModel.js";

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING, // e.g., 'card', 'bank', 'paypal'
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "successful", "failed"),
      defaultValue: "pending",
    },
    reference: {
      type: DataTypes.STRING,
      unique: true,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "USD",
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

async (params) => {
  // Associations
  Payment.belongsTo(Order, { foreignKey: "orderId", as: "order" });

  Payment.belongsTo(User, { foreignKey: "userId", as: "user" });
}


export default Payment;
