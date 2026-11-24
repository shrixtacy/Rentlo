import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  purpose: { type: String, enum: ['LOGIN', 'RESET'], required: true },
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.pre('save', async function (next) {
  if (this.isModified('otp')) {
    this.otp = await bcrypt.hash(this.otp, 10);
  }
  next();
});

export default mongoose.model('Otp', otpSchema);
