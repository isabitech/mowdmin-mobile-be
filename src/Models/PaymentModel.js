import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

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
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    method: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

export default Payment;
