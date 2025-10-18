import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";
import User from "./UserModel.js";
import Media from "./MediaModel.js";

const MediaBookmark = sequelize.define("MediaBookmark", {
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
}, {
    tableName: "media_bookmarks",
    timestamps: true,
});


async () => {
    MediaBookmark.belongsTo(User, { foreignKey: "userId", as: "user" });
    MediaBookmark.belongsTo(Media, { foreignKey: "mediaId", as: "media" });
}// Associations


export default MediaBookmark;
