import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";
import User from "./UserModel.js";
import Media from "./MediaModel.js";

const MediaBookmark = getSequelize().define("MediaBookmark", {
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
