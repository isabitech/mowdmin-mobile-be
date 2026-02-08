import mongoose from 'mongoose';

const PrayerLikeMongoSchema = new mongoose.Schema({
    prayerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PrayerMongo',
        required: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserMongo',
        required: true,
        index: true,
    },
}, {
    timestamps: true,
    collection: 'prayer_likes',
});

// Ensure a user can only like a prayer once
PrayerLikeMongoSchema.index({ prayerId: 1, userId: 1 }, { unique: true });

export default mongoose.model('PrayerLikeMongo', PrayerLikeMongoSchema);
