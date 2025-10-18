import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const MediaCategory = sequelize.define("MediaCategory", {
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
