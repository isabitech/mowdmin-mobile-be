import User from "./UserModel.js";
import Profile from "./ProfileModel.js";

// Define associations between User and Profile models
const setupAssociations = () => {
    // User has one Profile
    User.hasOne(Profile, { 
        foreignKey: "userId", 
        as: "profile",
        onDelete: "CASCADE"
    });
    
    // Profile belongs to User
    Profile.belongsTo(User, { 
        foreignKey: "userId", 
        targetKey: "id", 
        as: "user",
        onDelete: "CASCADE"
    });
    
    console.log('✅ User-Profile associations established');
};

export default setupAssociations;