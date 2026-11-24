import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  rentalFee: { type: Number, required: true },
  serviceFee: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONFIRMED', 'ACTIVE', 'RETURNED', 'DISPUTED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
  },
  renterNote: { type: String },
  paymentDeadline: { type: Date },
  handoverPhotos: [{ type: String }],
  returnPhotos: [{ type: String }],
  returnCondition: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Booking', bookingSchema);
