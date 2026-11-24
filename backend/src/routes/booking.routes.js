import { Router } from 'express';
import {
  createBookingController,
  getBookingById,
  updateBookingStatusController,
  handoverInspection,
  returnInspection,
  getMyBookings,
} from '../controllers/booking.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { uploadHandoverPhotos, uploadReturnPhotos } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/', verifyToken, createBookingController);
router.get('/', verifyToken, getMyBookings);
router.get('/:id', verifyToken, getBookingById);
router.patch('/:id/status', verifyToken, updateBookingStatusController);
router.post('/:id/handover', verifyToken, uploadHandoverPhotos, handoverInspection);
router.post('/:id/return', verifyToken, uploadReturnPhotos, returnInspection);

export default router;
