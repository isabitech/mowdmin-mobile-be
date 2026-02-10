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
    refreshTokenHash: {
        type: String,
    },
    refreshTokenExpiresAt: {
        type: Date,
    },
    replacedBy: {
        type: String, // IDs of the new session that replaced this one (for reuse detection)
    },
}, {
    timestamps: true,
});

export default mongoose.model('AuthMongo', AuthMongoSchema);
