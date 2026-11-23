import Listing from '../models/listing.model.js';
import Booking from '../models/booking.model.js';

const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  for (let i = 0; i < totalDays; i++) {
    dates.push(new Date(start.getTime() + i * 24 * 60 * 60 * 1000));
  }
  return dates;
};

export const createBooking = async ({ listingId, renterId, startDate, endDate, renterNote }) => {
  const listing = await Listing.findById(listingId);
  if (!listing) {
    const err = new Error('Listing not found');
    err.statusCode = 404;
    throw err;
  }
  if (listing.status !== 'AVAILABLE') {
    const err = new Error('Listing is not available');
    err.statusCode = 400;
    throw err;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  const blockedTimes = listing.blockedDates.map((d) => new Date(d).getTime());
  for (let i = 0; i < totalDays; i++) {
    const day = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    if (blockedTimes.includes(day.getTime())) {
      const err = new Error('Selected dates are not available');
      err.statusCode = 400;
      throw err;
    }
  }

  const rentalFee = totalDays * listing.pricePerDay;
  const serviceFee = rentalFee * 0.05;
  const securityDeposit = listing.securityDeposit;
  const totalAmount = rentalFee + securityDeposit + serviceFee;
  const paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const booking = await Booking.create({
    listing: listingId,
    renter: renterId,
    owner: listing.owner,
    startDate: start,
    endDate: end,
    totalDays,
    rentalFee,
    serviceFee,
    securityDeposit,
    totalAmount,
    renterNote,
    paymentDeadline,
    status: 'PENDING',
  });

  const newDates = getDatesInRange(start, end);
  await Listing.findByIdAndUpdate(listingId, { $push: { blockedDates: { $each: newDates } } });

  return booking;
};

export const updateBookingStatus = async (bookingId, userId, status, role) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  const ownerTransitions = ['APPROVED', 'REJECTED', 'COMPLETED'];
  const renterTransitions = ['CANCELLED'];
  const eitherTransitions = ['ACTIVE', 'RETURNED'];

  const ownerId = booking.owner.toString();
  const renterId = booking.renter.toString();

  if (ownerTransitions.includes(status) && ownerId !== userId) {
    const err = new Error('Only the owner can perform this action');
    err.statusCode = 403;
    throw err;
  }
  if (renterTransitions.includes(status) && renterId !== userId) {
    const err = new Error('Only the renter can perform this action');
    err.statusCode = 403;
    throw err;
  }
  if (eitherTransitions.includes(status) && ownerId !== userId && renterId !== userId) {
    const err = new Error('Not authorized to perform this action');
    err.statusCode = 403;
    throw err;
  }

  booking.status = status;
  await booking.save();

  if (status === 'REJECTED' || status === 'CANCELLED') {
    const datesToRemove = getDatesInRange(booking.startDate, booking.endDate);
    const removeTimestamps = datesToRemove.map((d) => d.getTime());
    const listing = await Listing.findById(booking.listing);
    if (listing) {
      listing.blockedDates = listing.blockedDates.filter(
        (d) => !removeTimestamps.includes(new Date(d).getTime())
      );
      await listing.save();
    }
  }

  return booking;
};

export const getBookingsForUser = async (userId, role, page = 1, limit = 20) => {
  const query = role === 'owner' ? { owner: userId } : { renter: userId };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('listing', 'title images pricePerDay')
      .populate('renter', 'name avatar')
      .populate('owner', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Booking.countDocuments(query),
  ]);

  return {
    bookings,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  };
};
