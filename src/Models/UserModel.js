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
    password: DataTypes.STRING,
    language: { type: DataTypes.ENUM("EN", "FR", "DE"), defaultValue: "EN" },
    emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
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

// Associations are defined centrally in Models/associations.js
export default User;
