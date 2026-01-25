// OrderModel.js
import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";
// import User from "./UserModel.js"; -> Moved to associations.js

const Order = sequelize.define(
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
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "cancelled", "shipped", "completed"),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.STRING,
    },
    shippingAddress: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

// Order.belongsTo(User, { foreignKey: "userId", as: "user" }); -> Moved to associations.js

export default Order;
