import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js"; // your sequelize instance

export const EventRegistration = sequelize.define(
    "EventRegistration",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        eventId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        ticketCode: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.ENUM("registered", "attended"),
            defaultValue: "registered",
        },
    },
    {
        tableName: "event_registrations",
        timestamps: true,
    }
);

EventRegistration.associations = () => {
    const { Event, User } = sequelize.models;
    EventRegistration.belongsTo(Event, {
        foreignKey: "eventId",
        as: "event",
    });
    EventRegistration.belongsTo(User, {
        foreignKey: "userId",
        as: "user",
    });
};




export default EventRegistration;

