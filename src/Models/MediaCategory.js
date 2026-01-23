import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const MediaCategory = sequelize.define(
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
