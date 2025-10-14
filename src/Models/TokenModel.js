import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";
import { User } from "./UserModel.js"; // Lazy import via sequelize.models will also work

const Token = sequelize.define(
  "Token",
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
    type: {
      type: DataTypes.ENUM("refresh", "reset", "verify"),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "tokens",
    timestamps: false,
  }
);

// Associations
Token.associate = () => {
  const { User } = sequelize.models;
  Token.belongsTo(User, { foreignKey: "userId", as: "user" });
};

export default Token;
