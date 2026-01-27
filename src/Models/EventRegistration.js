import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";
import User from "./UserModel.js";

const EventRegistration = getSequelize().define(
  "EventRegistration",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    eventId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM("registered", "attended"), defaultValue: "registered" },
  },
  { tableName: "event_registrations", timestamps: true }
);



// Lazy association for Event
(async () => {
  const { default: Event } = await import("./EventModel.js");
  
  EventRegistration.belongsTo(Event, { foreignKey: "eventId", as: "event" });
  EventRegistration.belongsTo(User, { foreignKey: "userId", as: "user" });
})();

export default EventRegistration;
