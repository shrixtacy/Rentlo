import Booking from '../models/booking.model.js';
import Review from '../models/review.model.js';
import Listing from '../models/listing.model.js';

export const submitReview = async ({ bookingId, reviewerId, targetType, targetId, rating, comment }) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  if (booking.status !== 'COMPLETED') {
    const err = new Error('Booking must be completed before reviewing');
    err.statusCode = 400;
    throw err;
  }

  const renter = booking.renter.toString();
  const owner = booking.owner.toString();
  if (reviewerId !== renter && reviewerId !== owner) {
    const err = new Error('Not authorized to review this booking');
    err.statusCode = 403;
    throw err;
  }

  const review = await Review.findOneAndUpdate(
    { booking: bookingId, reviewer: reviewerId, targetType },
    { booking: bookingId, reviewer: reviewerId, targetType, targetId, rating, comment },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (targetType === 'LISTING') {
    const agg = await Review.aggregate([
      { $match: { targetType: 'LISTING', targetId: review.targetId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (agg.length > 0) {
      await Listing.findByIdAndUpdate(targetId, {
        avgRating: Math.round(agg[0].avgRating * 10) / 10,
        reviewCount: agg[0].count,
      });
    }
  }

  return review;
};

export const getListingReviews = async (listingId, page = 1, limit = 20) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const query = { targetType: 'LISTING', targetId: listingId };
  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments(query),
  ]);
  return { reviews, total };
};

export const getUserReviews = async (userId) => {
  const reviews = await Review.find({ targetType: 'USER', targetId: userId })
    .populate('reviewer', 'name avatar')
    .sort({ createdAt: -1 });
  return reviews;
};
