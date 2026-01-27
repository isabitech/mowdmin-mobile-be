import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";

const Event = getSequelize().define(
  "Event",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("Crusade", "Baptism", "Communion", "Concert"), allowNull: false },
  },
  { tableName: "events", timestamps: true }
);

// Lazy association
(async () => {
  const { default: EventRegistration } = await import("./EventRegistration.js");
  Event.hasMany(EventRegistration, { foreignKey: "eventId", as: "registrations" });
})();

export default Event;
