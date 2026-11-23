import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import {
  submitReview,
  getListingReviews,
  getUserReviews,
} from '../services/review.service.js';

export const submitReviewController = asyncHandler(async (req, res) => {
  const { bookingId, targetType, targetId, rating, comment } = req.body;
  const review = await submitReview({
    bookingId,
    reviewerId: req.user.id,
    targetType,
    targetId,
    rating,
    comment,
  });
  return successResponse(res, 201, 'Review submitted', { review });
});

export const getListingReviewsController = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await getListingReviews(req.params.id, page, limit);
  return successResponse(res, 200, 'Reviews fetched', result);
});

export const getUserReviewsController = asyncHandler(async (req, res) => {
  const reviews = await getUserReviews(req.params.id);
  return successResponse(res, 200, 'User reviews fetched', { reviews });
});
