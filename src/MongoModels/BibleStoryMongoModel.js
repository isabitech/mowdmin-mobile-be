import mongoose from 'mongoose';

const bibleStorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
    },
    order: {
        type: Number,
        default: 0,
    },
    mediaIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MediaMongo'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const BibleStory = mongoose.model('BibleStory', bibleStorySchema);

export default BibleStory;
