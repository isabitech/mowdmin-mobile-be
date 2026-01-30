import mongoose from 'mongoose';

const bibleVerseSchema = new mongoose.Schema({
    passage: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    version: {
        type: String,
        default: 'KJV',
    },
    category: {
        type: String,
    },
    isDaily: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const BibleVerse = mongoose.model('BibleVerse', bibleVerseSchema);

export default BibleVerse;
