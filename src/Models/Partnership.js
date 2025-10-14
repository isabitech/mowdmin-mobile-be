import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Partnership = sequelize.define(
        "Partnership",
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
            partnershipType: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            message: DataTypes.TEXT,
            status: {
                type: DataTypes.ENUM("pending", "approved", "active"),
                defaultValue: "pending",
            },
        },
        {
            tableName: "partnerships",
            timestamps: true,
        }
    );

    Partnership.belongsTo(sequelize.models.User, {
        foreignKey: "userId",
        as: "user",
    });

    return Partnership;
};
