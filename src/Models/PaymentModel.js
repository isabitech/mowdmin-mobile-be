import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";

const Payment = getSequelize().define(
  "Payment",
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
    orderId: {
      type: DataTypes.UUID,
      allowNull: true, // Optional for other payment types
    },
    type: {
      type: DataTypes.ENUM("order", "donation", "subscription"),
      allowNull: false,
      defaultValue: "order",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "USD",
    },
    status: {
      type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
      defaultValue: "pending",
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    webhookEventId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      index: true,
    },
    method: {
      type: DataTypes.STRING,
      defaultValue: "stripe",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

export default Payment;
