import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js"; // your sequelize instance
import User from "./UserModel.js";

export const Donation = sequelize.define(
    "Donation",
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
        campaign: DataTypes.STRING,
        amount: DataTypes.DECIMAL(10, 2),
        currency: {
            type: DataTypes.STRING,
            defaultValue: "USD",
        },
        transactionRef: DataTypes.STRING,
        status: {
            type: DataTypes.ENUM("pending", "success", "failed"),
            defaultValue: "pending",
        },
    },
    {
        tableName: "donations",
        timestamps: true,
    }


);

Donation.associations = () => {
    const { User } = sequelize.models;
    Donation.belongsTo(User, {
        foreignKey: "userId",
        as: "user",

    });
};

export default Donation;
