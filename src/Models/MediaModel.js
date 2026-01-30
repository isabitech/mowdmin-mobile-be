import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";
import MediaCategory from "./MediaCategory.js";

const Media = getSequelize().define("Media", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("audio", "video", "text"),
    allowNull: false,
  },
  media_url: DataTypes.STRING,
  author: DataTypes.STRING,
  duration: DataTypes.STRING,
  is_downloadable: DataTypes.BOOLEAN,
  language: DataTypes.STRING,
  thumbnail: {
    type: DataTypes.STRING,
  },
}, {
  tableName: "media",
  timestamps: true,
});

// Associations
Media.belongsTo(MediaCategory, {
  foreignKey: "category_id",
  as: "category",
});


export default Media;
