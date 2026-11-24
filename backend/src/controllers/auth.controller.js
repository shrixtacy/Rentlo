import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import {
  registerUser,
  loginWithPassword,
  sendOTPEmail,
  verifyOTPAndLogin,
} from '../services/auth.service.js';
import User from '../models/user.model.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const { user, token } = await registerUser({ name, email, phone, password });
  return successResponse(res, 201, 'Registration successful', { user, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, otp } = req.body;
  if (otp) {
    const { user, token } = await verifyOTPAndLogin(email, otp);
    return successResponse(res, 200, 'Login successful', { user, token });
  }
  const { user, token } = await loginWithPassword({ email, password });
  return successResponse(res, 200, 'Login successful', { user, token });
});

export const requestOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await sendOTPEmail(email);
  return successResponse(res, 200, result.message, {});
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const { user, token } = await verifyOTPAndLogin(email, otp);
  return successResponse(res, 200, 'OTP verified', { user, token });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  return successResponse(res, 200, 'User fetched', { user });
});

export const logout = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'Logged out', { message: 'Logged out' });
});
