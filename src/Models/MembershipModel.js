import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";

const Membership = getSequelize().define(
    "Membership",
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
        baptismInterest: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        communionAlert: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "approved", "active"),
            defaultValue: "pending",
        },
    },
    {
        tableName: "memberships",
        timestamps: true,
    }
);

// Lazy association
(async () => {
    const { default: User } = await import("./UserModel.js");
    Membership.belongsTo(User, {
        foreignKey: "userId",
        as: "user",
    });
})();

export default Membership;
