import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";
import {
  DEFAULT_NOTIFICATION_DELIVERY,
  NOTIFICATION_TYPES,
} from "../Utils/notification.js";

const Notification = getSequelize().define(
  "Notification",
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...NOTIFICATION_TYPES),
      allowNull: false,
      defaultValue: "info",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    delivery: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: DEFAULT_NOTIFICATION_DELIVERY,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "read",
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
  }
);

export default Notification;
