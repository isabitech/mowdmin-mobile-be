import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const MediaBookmark = sequelize.define(
  "MediaBookmark",
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
    mediaId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "media_bookmarks",
    timestamps: true,
  }
);

export default MediaBookmark;
