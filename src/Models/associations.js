import User from "./UserModel.js";
import Order from "./OrderModel.js";
import Auth from "./AuthModel.js";
import Profile from "./ProfileModel.js";

// Define associations between models
const setupAssociations = () => {
    // User - Order Associations
    User.hasMany(Order, { foreignKey: "userId", as: "orders" });
    Order.belongsTo(User, { foreignKey: "userId", as: "user" });

    // User - Auth Sessions Associations
    User.hasMany(Auth, { foreignKey: "userId", as: "authSessions" });
    Auth.belongsTo(User, { foreignKey: "userId", as: "user" });

    // User - Profile Associations
    User.hasOne(Profile, {
        foreignKey: "userId",
        as: "profile",
        onDelete: "CASCADE"
    });

    Profile.belongsTo(User, {
        foreignKey: "userId",
        targetKey: "id",
        as: "user",
        onDelete: "CASCADE"
    });

    console.log('✅ Model associations established');
};

export default setupAssociations;
