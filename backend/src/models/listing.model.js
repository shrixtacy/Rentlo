import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['cameras', 'tools', 'camping', 'electronics', 'bikes', 'sports', 'party', 'books', 'other'],
    required: true,
  },
  pricePerDay: { type: Number, required: true, min: 0 },
  securityDeposit: { type: Number, required: true, min: 0 },
  itemValue: { type: Number },
  images: { type: [String], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number],
    address: {
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      full: { type: String },
    },
  },
  rules: { type: String },
  status: { type: String, enum: ['AVAILABLE', 'RENTED', 'PAUSED', 'DELETED'], default: 'AVAILABLE' },
  availableDates: [{ type: Date }],
  blockedDates: [{ type: Date }],
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

listingSchema.index({ location: '2dsphere' });
listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ category: 1, status: 1 });

export default mongoose.model('Listing', listingSchema);
