import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";

const MediaCategory = getSequelize().define(
  "MediaCategory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "media_categories",
    timestamps: true,
  }
);

export default MediaCategory;
