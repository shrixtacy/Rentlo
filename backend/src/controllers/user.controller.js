import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import Booking from '../models/booking.model.js';

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return successResponse(res, 200, 'User profile fetched', { user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, address },
    { new: true, runValidators: true }
  ).select('-passwordHash');
  return successResponse(res, 200, 'Profile updated', { user });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  const avatarUrl = req.file?.path;
  if (!avatarUrl) {
    const err = new Error('No file uploaded');
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: avatarUrl },
    { new: true }
  ).select('-passwordHash');
  return successResponse(res, 200, 'Avatar updated', { avatarUrl: user.avatar });
});

export const uploadKYC = asyncHandler(async (req, res) => {
  const docUrl = req.file?.path;
  if (!docUrl) {
    const err = new Error('No file uploaded');
    err.statusCode = 400;
    throw err;
  }
  const { kycDocType, kycDocNumber } = req.body;
  await User.findByIdAndUpdate(req.user.id, {
    kycDocUrl: docUrl,
    kycDocType,
    kycDocNumber,
    kycStatus: 'PENDING',
  });
  return successResponse(res, 200, 'KYC document uploaded, pending verification', {});
});

export const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ owner: req.user.id }).sort({ createdAt: -1 });
  return successResponse(res, 200, 'Listings fetched', { listings });
});

export const getMyBookingsAsRenter = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ renter: req.user.id })
    .populate('listing', 'title images pricePerDay')
    .populate('owner', 'name avatar')
    .sort({ createdAt: -1 });
  return successResponse(res, 200, 'Bookings fetched', { bookings });
});

export const getMyBookingsAsOwner = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ owner: req.user.id })
    .populate('listing', 'title images pricePerDay')
    .populate('renter', 'name avatar')
    .sort({ createdAt: -1 });
  return successResponse(res, 200, 'Bookings fetched', { bookings });
});
