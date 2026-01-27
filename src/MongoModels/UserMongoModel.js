import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserMongoSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  language: { type: String, enum: ['EN', 'FR', 'DE'], default: 'EN' },
  photo: { type: String },
  registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventRegistrationMongo' }],
  emailVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date, default: null },
  isAdmin: { type: Boolean, default: false },
}, {
  timestamps: true,
});

UserMongoSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});
export default mongoose.model('UserMongo', UserMongoSchema);
