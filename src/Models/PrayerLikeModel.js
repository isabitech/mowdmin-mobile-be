import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const PrayerLike = sequelize.define(
    "PrayerLike",
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
    },
    {
        tableName: "prayer_likes",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['prayer_id', 'user_id']
            }
        ]
    }
);

export default PrayerLike;
