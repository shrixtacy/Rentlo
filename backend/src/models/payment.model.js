import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({}, { timestamps: true });

export default mongoose.model('payment', paymentSchema);
