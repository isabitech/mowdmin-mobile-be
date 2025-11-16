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
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    prayedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
