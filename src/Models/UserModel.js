import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";
import bcrypt from "bcryptjs";

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING },
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
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Associations
User.associate = () => {
  const { Donation, PrayerRequest, EventRegistration } = sequelize.models;
  User.hasMany(Donation, { foreignKey: "userId", as: "donations" });
  User.hasMany(PrayerRequest, { foreignKey: "userId", as: "prayerRequests" });
  User.hasMany(EventRegistration, { foreignKey: "userId", as: "registrations" });
};

export default User;
