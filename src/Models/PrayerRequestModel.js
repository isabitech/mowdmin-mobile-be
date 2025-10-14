import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js"; // your sequelize instance
import User from "./UserModel.js";

export const PrayerRequest = sequelize.define(
    "PrayerRequest",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        title: {
            type: DataTypes.STRING
        },
        content: {
            type: DataTypes.TEXT
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        prayedCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
    },
    {
        tableName: "prayer_requests",
        timestamps: true,
    }
);

// PrayerRequest.belongsTo(User, {
//     foreignKey: "userId",
//     as: "user",
// });

export default PrayerRequest;