import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Media = sequelize.define(
        "Media",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            title: DataTypes.STRING,
            description: DataTypes.TEXT,
            category: DataTypes.ENUM("Sermon", "Album", "Teaching"),
            url: DataTypes.STRING,
            thumbnail: DataTypes.STRING,
        },
        {
            tableName: "media",
            timestamps: true,
        }
    );

    return Media;
};
