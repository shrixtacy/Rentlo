import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar as uploadAvatarController,
  uploadKYC as uploadKYCController,
  getMyListings,
  getMyBookingsAsRenter,
  getMyBookingsAsOwner,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  uploadAvatar as uploadAvatarMiddleware,
  uploadKYC as uploadKYCMiddleware,
} from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/profile', verifyToken, getProfile);
router.patch('/profile', verifyToken, updateProfile);
router.post('/avatar', verifyToken, uploadAvatarMiddleware, uploadAvatarController);
router.post('/kyc/upload', verifyToken, uploadKYCMiddleware, uploadKYCController);
router.get('/listings', verifyToken, getMyListings);
router.get('/bookings', verifyToken, (req, res, next) => {
  const role = req.query.role || 'renter';
  if (role === 'owner') return getMyBookingsAsOwner(req, res, next);
  return getMyBookingsAsRenter(req, res, next);
});

export default router;
