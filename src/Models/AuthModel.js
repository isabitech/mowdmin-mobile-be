import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const Auth = sequelize.define(
    "Auth",
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
        tokenHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deviceInfo: {
            type: DataTypes.STRING, // Can store User-Agent or simplified device name
            allowNull: true,
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lastLogin: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        isLoggedOut: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        loggedOutAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "auths",
        timestamps: true,
        updatedAt: false, // Only createdAt matters for login time usually, but timestamps: true gives both
    }
);

export default Auth;
