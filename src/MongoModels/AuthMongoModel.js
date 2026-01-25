import mongoose from 'mongoose';

const AuthMongoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserMongo',
        required: true,
    },
    tokenHash: {
        type: String,
        required: true,
    },
    deviceInfo: {
        type: String,
    },
    ipAddress: {
        type: String,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    isLoggedOut: {
        type: Boolean,
        default: false,
    },
    loggedOutAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

export default mongoose.model('AuthMongo', AuthMongoSchema);
