import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Otp from '../models/otp.model.js';
import { generateToken } from '../utils/generateToken.js';
import { generateOTP, hashOTP, verifyOTP } from '../utils/generateOTP.js';
import { sendEmail } from '../configs/email.config.js';

export const registerUser = async ({ name, email, phone, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, phone, passwordHash });
  const token = generateToken(user);
  return { user, token };
};

export const loginWithPassword = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const token = generateToken(user);
  return { user, token };
};

export const sendOTPEmail = async (email) => {
  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.findOneAndUpdate(
    { email, purpose: 'LOGIN' },
    { email, otp: hashedOtp, purpose: 'LOGIN', expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;">
      <h2>Your Rentlo OTP</h2>
      <p>Use the following OTP to log in. It expires in 10 minutes.</p>
      <div style="font-size:2rem;font-weight:bold;letter-spacing:0.3rem;padding:1rem;background:#f4f4f4;border-radius:8px;text-align:center;">${otp}</div>
      <p style="color:#888;font-size:0.85rem;">Do not share this code with anyone.</p>
    </div>
  `;

  await sendEmail(email, 'Your Rentlo OTP', html);
  return { message: 'OTP sent' };
};

export const verifyOTPAndLogin = async (email, otp) => {
  const otpDoc = await Otp.findOne({
    email,
    purpose: 'LOGIN',
    expiresAt: { $gt: new Date() },
  });

  if (!otpDoc) {
    const err = new Error('OTP expired or not found');
    err.statusCode = 401;
    throw err;
  }

  const valid = await verifyOTP(otp, otpDoc.otp);
  if (!valid) {
    const err = new Error('Invalid OTP');
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 401;
    throw err;
  }

  await Otp.deleteOne({ _id: otpDoc._id });
  const token = generateToken(user);
  return { user, token };
};
