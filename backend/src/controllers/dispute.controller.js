import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import { raiseDispute, resolveDispute } from '../services/dispute.service.js';
import Dispute from '../models/dispute.model.js';

export const raiseDisputeController = asyncHandler(async (req, res) => {
  const evidenceUrls = (req.files || []).map((f) => f.path);
  const { bookingId, reason, description, claimedDeduction } = req.body;
  const dispute = await raiseDispute({
    bookingId,
    raisedBy: req.user.id,
    reason,
    description,
    claimedDeduction: parseFloat(claimedDeduction),
    evidenceUrls,
  });
  return successResponse(res, 201, 'Dispute raised', { dispute });
});

export const getDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('raisedBy', 'name avatar')
    .populate('booking');
  if (!dispute) {
    const err = new Error('Dispute not found');
    err.statusCode = 404;
    throw err;
  }
  return successResponse(res, 200, 'Dispute fetched', { dispute });
});

export const resolveDisputeController = asyncHandler(async (req, res) => {
  const { approvedDeduction, adminNotes, resolution } = req.body;
  const dispute = await resolveDispute({
    disputeId: req.params.id,
    adminId: req.user.id,
    approvedDeduction: parseFloat(approvedDeduction),
    adminNotes,
    resolution,
  });
  return successResponse(res, 200, 'Dispute resolved', { dispute });
});
