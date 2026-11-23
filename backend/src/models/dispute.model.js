import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: {
    type: String,
    enum: ['ITEM_DAMAGED', 'ITEM_MISSING', 'ITEM_NOT_RETURNED', 'OTHER'],
    required: true,
  },
  description: { type: String, required: true },
  claimedDeduction: { type: Number, required: true },
  evidencePhotos: [{ type: String }],
  status: { type: String, enum: ['UNDER_REVIEW', 'RESOLVED', 'DISMISSED'], default: 'UNDER_REVIEW' },
  adminNotes: { type: String },
  approvedDeduction: { type: Number },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Dispute', disputeSchema);
