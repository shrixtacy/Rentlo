import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import {
  createBooking,
  updateBookingStatus,
  getBookingsForUser,
} from '../services/booking.service.js';
import Booking from '../models/booking.model.js';

export const createBookingController = asyncHandler(async (req, res) => {
  const { listingId, startDate, endDate, renterNote } = req.body;
  const booking = await createBooking({
    listingId,
    renterId: req.user.id,
    startDate,
    endDate,
    renterNote,
  });
  return successResponse(res, 201, 'Booking created', { booking });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('listing', 'title images pricePerDay')
    .populate('renter', 'name avatar phone')
    .populate('owner', 'name avatar phone');
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  return successResponse(res, 200, 'Booking fetched', { booking });
});

export const updateBookingStatusController = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await updateBookingStatus(req.params.id, req.user.id, status, req.user.role);
  return successResponse(res, 200, 'Booking status updated', { booking });
});

export const handoverInspection = asyncHandler(async (req, res) => {
  const photos = (req.files || []).map((f) => f.path);
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { handoverPhotos: photos, status: 'ACTIVE' },
    { new: true }
  );
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  return successResponse(res, 200, 'Handover recorded', { booking });
});

export const returnInspection = asyncHandler(async (req, res) => {
  const photos = (req.files || []).map((f) => f.path);
  const { returnCondition } = req.body;
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { returnPhotos: photos, returnCondition, status: 'RETURNED' },
    { new: true }
  );
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  return successResponse(res, 200, 'Return recorded', { booking });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const { role, page, limit } = req.query;
  const result = await getBookingsForUser(req.user.id, role || 'renter', page, limit);
  return successResponse(res, 200, 'Bookings fetched', result);
});
