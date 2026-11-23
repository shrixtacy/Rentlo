import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['renter', 'owner', 'both', 'admin'], default: 'renter' },
  kycStatus: { type: String, enum: ['UNVERIFIED', 'PENDING', 'VERIFIED'], default: 'UNVERIFIED' },
  kycDocUrl: { type: String },
  kycDocType: { type: String },
  kycDocNumber: { type: String },
  avatar: { type: String },
  address: {
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
  },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number],
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });

userSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

export default mongoose.model('User', userSchema);
