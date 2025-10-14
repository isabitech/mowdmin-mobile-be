import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Membership = sequelize.define(
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

    Membership.belongsTo(sequelize.models.User, {
        foreignKey: "userId",
        as: "user",
    });

    return Membership;
};
