import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";
import bcrypt from "bcryptjs";
// import Order from "./OrderModel.js"; -> Moved to associations.js

const User = getSequelize().define(
  "User",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: true }, // Nullable for social auth users
    language: { type: DataTypes.ENUM("EN", "FR", "DE"), defaultValue: "EN" },
    emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Social Authentication Fields
    googleId: { type: DataTypes.STRING, unique: true, allowNull: true, index: true },
    appleId: { type: DataTypes.STRING, unique: true, allowNull: true, index: true },
    profilePicture: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        // Only hash password if it exists (not null for social auth)
        if (user.password && user.password !== null) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        // Only hash password if it changed and is not null
        if (user.changed("password") && user.password && user.password !== null) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Associations are defined centrally in Models/associations.js
export default User;
