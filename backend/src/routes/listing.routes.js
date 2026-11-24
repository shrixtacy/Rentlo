import { Router } from 'express';
import {
  createListingController,
  getListings,
  getListingByIdController,
  updateListingController,
  deleteListingController,
  checkAvailabilityController,
} from '../controllers/listing.controller.js';
import { getListingReviewsController } from '../controllers/review.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { uploadListingImages } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/', getListings);
router.post('/', verifyToken, uploadListingImages, createListingController);
router.get('/:id', getListingByIdController);
router.put('/:id', verifyToken, updateListingController);
router.delete('/:id', verifyToken, deleteListingController);
router.get('/:id/availability', checkAvailabilityController);
router.get('/:id/reviews', getListingReviewsController);

export default router;
