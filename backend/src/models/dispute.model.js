import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({}, { timestamps: true });

export default mongoose.model('dispute', disputeSchema);
