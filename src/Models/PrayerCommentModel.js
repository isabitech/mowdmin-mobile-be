import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const PrayerComment = sequelize.define(
    "PrayerComment",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        prayerId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'prayer_id',
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id',
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "prayer_comments",
        timestamps: true,
    }
);

export default PrayerComment;
