import User from "./UserModel.js";
import Order from "./OrderModel.js";
import Auth from "./AuthModel.js";

export default function defineAssociations() {
    User.hasMany(Order, { foreignKey: "userId", as: "order" });
    Order.belongsTo(User, { foreignKey: "userId", as: "user" });

    User.hasMany(Auth, { foreignKey: "userId", as: "authSessions" });
    Auth.belongsTo(User, { foreignKey: "userId", as: "user" });
}
