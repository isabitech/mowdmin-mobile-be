import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";

const Profile = getSequelize().define(
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
      type: DataTypes.STRING,
    },
    photoUrl: {
      type: DataTypes.STRING,
    },
    phone_number: {
      type: DataTypes.STRING
    },
    bio: {
      type: DataTypes.TEXT,
    },
    location: {
      type: DataTypes.STRING,
    },
    birthdate: {
      type: DataTypes.DATE,
    },
    language: {
      type: DataTypes.ENUM('EN', 'FR', 'DE'),
      defaultValue: 'EN',
    },
    notificationPreferences: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Store notification settings as JSON object',
    },
  },
  {
    tableName: "profiles",
    timestamps: true,
  }
);

export default Profile;
