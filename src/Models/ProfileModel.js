import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Profile = sequelize.define(
        "Profile",
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
            displayName: {
                type: DataTypes.STRING
            },
            photoUrl: {
                type: DataTypes.STRING
            },
            bio: {
                type: DataTypes.TEXT
            },
            location: {
                type: DataTypes.STRING
            },
            birthdate: {
                type: DataTypes.DATE
            },
        },
        {
            tableName: "profiles",
            timestamps: true,
        }
    );
    Profile.hasOne(sequelize.models.User, { foreignKey: "id", sourceKey: "userId", as: "user" });

    return Profile;
};
