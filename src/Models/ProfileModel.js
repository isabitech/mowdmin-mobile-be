import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";
import User from "./UserModel.js";

const Profile = sequelize.define(
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
  },
  {
    tableName: "profiles",
    timestamps: true,
  }
);
async () => {
  Profile.belongsTo(User, { foreignKey: "userId", targetKey: "id", as: "user" });
  User.hasOne(Profile, { foreignKey: "userId", as: "profile" });
}
// Associations


export default Profile;
