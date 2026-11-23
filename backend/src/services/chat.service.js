import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const getOrCreateConversation = async (user1Id, user2Id, listingId) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [user1Id, user2Id] },
    listing: listingId,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [user1Id, user2Id],
      listing: listingId,
    });
  }

  return conversation;
};

export const getConversations = async (userId) => {
  const conversations = await Conversation.find({ participants: userId })
    .populate('participants', 'name avatar')
    .populate('listing', 'title images')
    .sort({ lastMessageAt: -1 });
  return conversations;
};

export const getMessages = async (conversationId, userId, page = 1, limit = 50) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }

  const isParticipant = conversation.participants.some((p) => p.toString() === userId);
  if (!isParticipant) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [messages, total] = await Promise.all([
    Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Message.countDocuments({ conversation: conversationId }),
  ]);

  await Message.updateMany(
    { conversation: conversationId, receiver: userId, isRead: false },
    { isRead: true }
  );

  return { messages, total };
};

export const sendMessage = async ({ conversationId, senderId, receiverId, listingId, content, messageType, imageUrl }) => {
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    receiver: receiverId,
    listing: listingId,
    content,
    messageType: messageType || 'text',
    imageUrl,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: content || (messageType === 'image' ? '📷 Image' : ''),
    lastMessageAt: new Date(),
  });

  return message;
};
