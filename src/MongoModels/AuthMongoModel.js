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

AuthMongoSchema.index({ tokenHash: 1 });
AuthMongoSchema.index({ refreshTokenHash: 1 });
AuthMongoSchema.index({ userId: 1, isLoggedOut: 1 });

export default mongoose.model('AuthMongo', AuthMongoSchema);
