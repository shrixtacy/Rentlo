import Booking from '../models/booking.model.js';
import Dispute from '../models/dispute.model.js';

export const raiseDispute = async ({ bookingId, raisedBy, reason, description, claimedDeduction, evidenceUrls }) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  if (!['RETURNED', 'COMPLETED'].includes(booking.status)) {
    const err = new Error('Dispute can only be raised after item is returned or booking is completed');
    err.statusCode = 400;
    throw err;
  }

  const dispute = await Dispute.create({
    booking: bookingId,
    raisedBy,
    reason,
    description,
    claimedDeduction,
    evidencePhotos: evidenceUrls || [],
    status: 'UNDER_REVIEW',
  });

  await Booking.findByIdAndUpdate(bookingId, { status: 'DISPUTED' });

  return dispute;
};

export const resolveDispute = async ({ disputeId, adminId, approvedDeduction, adminNotes, resolution }) => {
  const dispute = await Dispute.findById(disputeId);
  if (!dispute) {
    const err = new Error('Dispute not found');
    err.statusCode = 404;
    throw err;
  }

  dispute.status = resolution === 'RESOLVED' ? 'RESOLVED' : 'DISMISSED';
  dispute.approvedDeduction = approvedDeduction;
  dispute.adminNotes = adminNotes;
  dispute.resolvedAt = new Date();
  await dispute.save();

  if (resolution === 'RESOLVED' && approvedDeduction > 0) {
    await Booking.findByIdAndUpdate(dispute.booking, { status: 'COMPLETED' });
  }

  return dispute;
};
