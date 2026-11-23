import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
} from '../services/chat.service.js';
import Message from '../models/message.model.js';

export const getConversationsController = asyncHandler(async (req, res) => {
  const conversations = await getConversations(req.user.id);
  return successResponse(res, 200, 'Conversations fetched', { conversations });
});

export const getOrCreateConversationController = asyncHandler(async (req, res) => {
  const { otherUserId, listingId } = req.body;
  const conversation = await getOrCreateConversation(req.user.id, otherUserId, listingId);
  return successResponse(res, 200, 'Conversation fetched', { conversation });
});

export const getMessagesController = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await getMessages(req.params.conversationId, req.user.id, page, limit);
  return successResponse(res, 200, 'Messages fetched', result);
});

export const sendMessageController = asyncHandler(async (req, res) => {
  const { content, messageType, imageUrl, receiverId } = req.body;
  const message = await sendMessage({
    conversationId: req.params.conversationId,
    senderId: req.user.id,
    receiverId,
    listingId: req.body.listingId,
    content,
    messageType,
    imageUrl,
  });

  const io = req.app.get('io');
  if (io) {
    io.to(req.params.conversationId).emit('message_received', message);
  }

  return successResponse(res, 201, 'Message sent', { message });
});

export const markRead = asyncHandler(async (req, res) => {
  const result = await Message.updateMany(
    { conversation: req.params.conversationId, receiver: req.user.id, isRead: false },
    { isRead: true }
  );
  return successResponse(res, 200, 'Messages marked as read', { updated: result.modifiedCount });
});
