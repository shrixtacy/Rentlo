import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'FAILED'], default: 'PENDING' },
  breakdown: {
    rentAmount: { type: Number },
    depositAmount: { type: Number },
    serviceFee: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Payment', paymentSchema);
