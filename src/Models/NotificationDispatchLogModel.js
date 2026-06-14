import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";

const NotificationDispatchLog = getSequelize().define(
  "NotificationDispatchLog",
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
    referenceKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pushSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    inAppCreated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lastSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "notification_dispatch_logs",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "referenceKey"],
      },
    ],
  },
);

export default NotificationDispatchLog;
