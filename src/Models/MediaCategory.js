import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";

const MediaCategory = getSequelize().define("MediaCategory", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
}, {
    tableName: "media_categories",
    timestamps: true,
});
async () => {
    MediaCategory.hasMany(Media, { foreignKey: "category_id", as: "media" });

}

export default MediaCategory;
