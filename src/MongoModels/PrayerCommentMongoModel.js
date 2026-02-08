import mongoose from 'mongoose';

const PrayerCommentMongoSchema = new mongoose.Schema({
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
    },
    comment: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    collection: 'prayer_comments',
});

export default mongoose.model('PrayerCommentMongo', PrayerCommentMongoSchema);
