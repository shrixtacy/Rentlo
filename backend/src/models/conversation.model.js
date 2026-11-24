import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
    validate: { validator: (v) => v.length >= 2, message: 'At least 2 participants required' },
  },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

conversationSchema.index({ participants: 1, listing: 1 }, { unique: true });

export default mongoose.model('Conversation', conversationSchema);
