import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";

const Donation = getSequelize().define(
  "Donation",
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
    campaign: DataTypes.STRING,
    amount: DataTypes.DECIMAL(10, 2),
    currency: {
      type: DataTypes.STRING,
      defaultValue: "USD",
    },
    transactionRef: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM("pending", "success", "failed"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "donations",
    timestamps: true,
  }
);

// Lazy association to prevent circular reference
(async () => {
  const { default: User } = await import("./UserModel.js");
  Donation.belongsTo(User, { foreignKey: "userId", as: "user" });
})();

export default Donation;
