import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import User from '../models/user.model.js';
import Dispute from '../models/dispute.model.js';

const router = Router();

router.get(
  '/kyc/pending',
  verifyToken,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const users = await User.find({ kycStatus: 'PENDING' }).select('-passwordHash');
    return successResponse(res, 200, 'Pending KYC users fetched', { users });
  })
);

router.patch(
  '/kyc/:userId',
  verifyToken,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { kycStatus } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { kycStatus },
      { new: true }
    ).select('-passwordHash');
    return successResponse(res, 200, 'KYC status updated', { user });
  })
);

router.get(
  '/disputes',
  verifyToken,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const disputes = await Dispute.find()
      .populate('raisedBy', 'name email')
      .populate('booking')
      .sort({ createdAt: -1 });
    return successResponse(res, 200, 'Disputes fetched', { disputes });
  })
);

export default router;
