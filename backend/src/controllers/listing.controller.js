import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import {
  createListing,
  searchListings,
  getListingById,
  updateListing,
  deleteListing,
  checkAvailability,
} from '../services/listing.service.js';

export const createListingController = asyncHandler(async (req, res) => {
  const imageUrls = (req.files || []).map((f) => f.path);
  const listing = await createListing(req.user.id, req.body, imageUrls);
  return successResponse(res, 201, 'Listing created', { listing });
});

export const getListings = asyncHandler(async (req, res) => {
  const result = await searchListings(req.query);
  return successResponse(res, 200, 'Listings fetched', result);
});

export const getListingByIdController = asyncHandler(async (req, res) => {
  const listing = await getListingById(req.params.id);
  return successResponse(res, 200, 'Listing fetched', { listing });
});

export const updateListingController = asyncHandler(async (req, res) => {
  const listing = await updateListing(req.params.id, req.user.id, req.body);
  return successResponse(res, 200, 'Listing updated', { listing });
});

export const deleteListingController = asyncHandler(async (req, res) => {
  await deleteListing(req.params.id, req.user.id);
  return successResponse(res, 200, 'Listing deleted', {});
});

export const checkAvailabilityController = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await checkAvailability(req.params.id, startDate, endDate);
  return successResponse(res, 200, 'Availability checked', result);
});
