import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({}, { timestamps: true });

export default mongoose.model('listing', listingSchema);
