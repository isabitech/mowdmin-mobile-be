import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Event = sequelize.define(
        "Event",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            title: DataTypes.STRING,
            description: DataTypes.TEXT,
            image: DataTypes.STRING,
            date: DataTypes.DATE,
            time: DataTypes.STRING,
            location: DataTypes.STRING,
            type: DataTypes.ENUM("Crusade", "Baptism", "Communion", "Concert"),
        },
        {
            tableName: "events",
            timestamps: true,
        }
    );

    Event.hasMany(sequelize.models.EventRegistration, {
        foreignKey: "eventId",
        as: "registrations",
    });

    return Event;
};
