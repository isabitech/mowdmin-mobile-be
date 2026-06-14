import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";

const NotificationDevice = getSequelize().define(
  "NotificationDevice",
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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    platform: {
      type: DataTypes.ENUM("android", "ios", "web"),
      allowNull: false,
    },
    deviceName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    appVersion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locale: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastSeenAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notification_devices",
    timestamps: true,
  },
);

export default NotificationDevice;
