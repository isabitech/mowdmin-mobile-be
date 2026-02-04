import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js"; // Sequelize instance

const PrayerRequest = getSequelize().define(
  "PrayerRequest",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "prayer_requests",
    timestamps: true,
  }
);

// Lazy association — avoids circular import crash
(async () => {
  const { default: User } = await import("./UserModel.js");
  PrayerRequest.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });
})();

export default PrayerRequest;
