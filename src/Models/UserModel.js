import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js"; // your sequelize instance
import { Donation } from "./DonationModel.js"; // import other models
import { PrayerRequest } from "./PrayerRequestModel.js";
import { EventRegistration } from "./EventRegistration.js";
// Define the User model directly
export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: DataTypes.STRING,
    language: {
      type: DataTypes.ENUM("EN", "FR", "DE"),
      defaultValue: "EN",
    },
    photo: DataTypes.STRING,
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

// Define associations if the other models are already imported
// Example (you need to import Donation, PrayerRequest, EventRegistration first):
User.hasMany(Donation, { foreignKey: "userId", as: "donations" });
User.hasMany(PrayerRequest, { foreignKey: "userId", as: "prayerRequests" });
User.hasMany(EventRegistration, { foreignKey: "userId", as: "registrations" });

export default User;
