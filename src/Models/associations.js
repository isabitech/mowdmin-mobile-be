import User from "./UserModel.js";
import Order from "./OrderModel.js";
import Auth from "./AuthModel.js";
import Profile from "./ProfileModel.js";
import EventRegistration from "./EventRegistration.js";
import MediaBookmark from "./MediaBookmarksModel.js";
import Payment from "./PaymentModel.js";

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

    // User - EventRegistration Associations
    User.hasMany(EventRegistration, { foreignKey: "userId", as: "registrations" });
    EventRegistration.belongsTo(User, { foreignKey: "userId", as: "user" });

    // User - MediaBookmark Associations
    User.hasMany(MediaBookmark, { foreignKey: "userId", as: "bookmarks" });
    MediaBookmark.belongsTo(User, { foreignKey: "userId", as: "user" });

    // User - Payment Associations
    User.hasMany(Payment, { foreignKey: "userId", as: "payments" });
    Payment.belongsTo(User, { foreignKey: "userId", as: "user" });

    console.log('✅ Model associations established');
};

export default setupAssociations;
