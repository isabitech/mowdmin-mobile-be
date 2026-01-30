import mongoose from 'mongoose';

// Group Schema
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    creatorId: { type: String, required: true },
    isPrivate: { type: Boolean, default: false }
}, { timestamps: true });

export const Group = mongoose.model('Group', groupSchema);

// Group Member Schema
const groupMemberSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    userId: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Member'], default: 'Member' }
}, { timestamps: true });

export const GroupMember = mongoose.model('GroupMember', groupMemberSchema);

// Group Message Schema
const groupMessageSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    senderId: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, default: 'text' }
}, { timestamps: true });

export const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);
