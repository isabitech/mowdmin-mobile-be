import User from "./UserModel.js";
import Order from "./OrderModel.js";
import Auth from "./AuthModel.js";
import Profile from "./ProfileModel.js";
import EventRegistration from "./EventRegistration.js";
import MediaBookmark from "./MediaBookmarksModel.js";
import Payment from "./PaymentModel.js";
import Media from "./MediaModel.js";
import BibleStory from "./BibleStoryModel.js";
import BibleVerse from "./BibleVerseModel.js";
import Ministry from "./MinistryModel.js";
import BibleStoryMedia from "./BibleStoryMediaModel.js";
import { Group, GroupMember, GroupMessage } from "./GroupModels.js";
import Prayer from "./PrayerModel.js";
import PrayerComment from "./PrayerCommentModel.js";
import PrayerLike from "./PrayerLikeModel.js";

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

    // Group Associations
    Group.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
    Group.hasMany(GroupMember, { foreignKey: "groupId", as: "members" });
    GroupMember.belongsTo(Group, { foreignKey: "groupId", as: "group" });
    GroupMember.belongsTo(User, { foreignKey: "userId", as: "user" });
    Group.hasMany(GroupMessage, { foreignKey: "groupId", as: "messages" });
    GroupMessage.belongsTo(Group, { foreignKey: "groupId", as: "group" });
    GroupMessage.belongsTo(User, { foreignKey: "senderId", as: "sender" });

    // BibleStory - Media Associations (Many-to-Many via Join Table)
    BibleStory.belongsToMany(Media, {
        through: BibleStoryMedia,
        foreignKey: "bible_story_id",
        otherKey: "media_id",
        as: "media"
    });
    Media.belongsToMany(BibleStory, {
        through: BibleStoryMedia,
        foreignKey: "media_id",
        otherKey: "bible_story_id",
        as: "stories"
    });

    // Prayer - PrayerComment Associations
    Prayer.hasMany(PrayerComment, { foreignKey: "prayerId", as: "comments" });
    PrayerComment.belongsTo(Prayer, { foreignKey: "prayerId", as: "prayer" });
    User.hasMany(PrayerComment, { foreignKey: "userId", as: "prayerComments" });
    PrayerComment.belongsTo(User, { foreignKey: "userId", as: "user" });

    // Prayer - PrayerLike Associations
    Prayer.hasMany(PrayerLike, { foreignKey: "prayerId", as: "prayerLikes" });
    PrayerLike.belongsTo(Prayer, { foreignKey: "prayerId", as: "prayer" });
    User.hasMany(PrayerLike, { foreignKey: "userId", as: "likedPrayers" });
    PrayerLike.belongsTo(User, { foreignKey: "userId", as: "user" });

    console.log('✅ Model associations established');
};

export default setupAssociations;
