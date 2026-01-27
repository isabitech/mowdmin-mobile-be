import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const Prayer = sequelize.define(
  "Prayer",
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    prayer_request_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "prayers",
    timestamps: true,
  }
);

export default Prayer;
