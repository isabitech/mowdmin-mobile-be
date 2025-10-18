import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js"; // Sequelize instance
import PrayerRequest from "./PrayerRequestModel.js";

const Prayer = sequelize.define(
    "Prayer",
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
        prayer_request_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        
    },
    {
        tableName: "prayers",
        timestamps: true,
    }
);

// Lazy association — avoids circular import crash
(async () => {
    const { default: User } = await import("./UserModel.js");
    Prayer.belongsTo(User, {
        foreignKey: "userId",
        as: "user",
    });
    Prayer.belongsTo(PrayerRequest,{
        foreignKey:"prayer_request_id",
        as:"prayerRequest"
    })
})();

export default Prayer;
