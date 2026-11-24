import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useApi } from '../hooks/useApi';
import Avatar from '../components/ui/Avatar';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInput from '../components/chat/ChatInput';
import Spinner from '../components/ui/Spinner';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

export default function Messages() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { get, post } = useApi();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [convoLoading, setConvoLoading] = useState(true);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingConvos, setTypingConvos] = useState({});
  const [sendingLoading, setSendingLoading] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    setConvoLoading(true);
    try {
      const res = await get('/chat/conversations');
      const convos = res.data?.conversations || [];
      setConversations(convos);

      // Auto-open if URL has ?conversation=
      const convoId = searchParams.get('conversation');
      if (convoId) {
        const found = convos.find((c) => c._id === convoId);
        if (found) {
          setActiveConvo(found);
        } else {
          // Conversation not in list yet — still open with partial info
          setActiveConvo({ _id: convoId });
        }
      }
    } catch {
      // silent
    } finally {
      setConvoLoading(false);
    }
  }, [get, searchParams]);

  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConvo?._id) return;
    const loadMessages = async () => {
      setMessagesLoading(true);
      try {
        const res = await get(`/chat/conversations/${activeConvo._id}/messages`);
        setMessages(res.data?.messages || []);
      } catch {
        // silent
      } finally {
        setMessagesLoading(false);
      }
    };
    loadMessages();
  }, [activeConvo?._id]);

  // Socket: join/leave conversation room
  useEffect(() => {
    if (!socket || !activeConvo?._id) return;
    socket.emit('join_conversation', activeConvo._id);
    return () => {
      // No specific leave event needed; socket room is cleaned server-side
    };
  }, [socket, activeConvo?._id]);

  // Socket: listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const onMessage = ({ conversationId, message }) => {
      if (activeConvo?._id === conversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
      // Refresh conversation list to update lastMessage
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
            : c
        )
      );
    };

    const onTyping = ({ conversationId }) => {
      setTypingConvos((prev) => ({ ...prev, [conversationId]: true }));
    };

    const onStopTyping = ({ conversationId }) => {
      setTypingConvos((prev) => ({ ...prev, [conversationId]: false }));
    };

    socket.on('message_received', onMessage);
    socket.on('typing', onTyping);
    socket.on('stop_typing', onStopTyping);

    return () => {
      socket.off('message_received', onMessage);
      socket.off('typing', onTyping);
      socket.off('stop_typing', onStopTyping);
    };
  }, [socket, activeConvo?._id]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (content) => {
    if (!activeConvo?._id || !content.trim()) return;
    setSendingLoading(true);

    // Optimistic: emit via socket
    if (socket) {
      socket.emit('send_message', { conversationId: activeConvo._id, content });
    }

    try {
      const res = await post(`/chat/conversations/${activeConvo._id}/messages`, { content });
      const newMsg = res.data?.message;
      if (newMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConvo._id
              ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
              : c
          )
        );
      }
    } catch {
      // silent — socket may have already delivered
    } finally {
      setSendingLoading(false);
    }
  };

  const handleInputChange = () => {
    if (!socket || !activeConvo?._id) return;
    socket.emit('typing', activeConvo._id);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', activeConvo._id);
    }, 2000);
  };

  const isTyping = activeConvo && typingConvos[activeConvo._id];

  // On mobile: show list OR chat; on desktop: side-by-side
  const isMobileChat = !!activeConvo;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-3rem)] flex lg:gap-0 overflow-hidden"
    >
      {/* Conversations list */}
      <div
        className={`${isMobileChat ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 lg:flex-shrink-0 bg-white border-r border-gray-100`}
      >
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-extrabold text-dark">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convoLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 px-4 text-muted">
              <p className="text-4xl mb-3">💬</p>
              <p className="font-semibold text-dark">No conversations yet</p>
              <p className="text-sm mt-1">Start a chat from a listing page.</p>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo._id}
                onClick={() => setActiveConvo(convo)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-background transition-colors text-left border-b border-gray-50 ${
                  activeConvo?._id === convo._id ? 'bg-primary/10' : ''
                }`}
              >
                <Avatar src={convo.otherUser?.avatar} name={convo.otherUser?.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-dark text-sm truncate">{convo.otherUser?.name}</p>
                    <p className="text-muted text-xs flex-shrink-0 ml-2">{timeAgo(convo.lastMessageAt)}</p>
                  </div>
                  <p className="text-muted text-xs truncate mt-0.5">{convo.listing?.title}</p>
                  <p className="text-muted text-xs truncate mt-0.5">{convo.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      <div
        className={`${!isMobileChat ? 'hidden lg:flex' : 'flex'} flex-1 flex-col bg-background`}
      >
        {!activeConvo ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted">
            <p className="text-5xl mb-4">💬</p>
            <p className="font-semibold text-dark">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setActiveConvo(null)}
                className="lg:hidden p-1 rounded-full hover:bg-gray-100 transition-colors text-muted"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <Avatar
                src={activeConvo.otherUser?.avatar}
                name={activeConvo.otherUser?.name}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-dark text-sm">{activeConvo.otherUser?.name || 'User'}</p>
                {activeConvo.listing?.title && (
                  <p className="text-muted text-xs truncate">re: {activeConvo.listing.title}</p>
                )}
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">
                  No messages yet. Say hello! 👋
                </div>
              ) : (
                messages.map((msg) => (
                  <ChatBubble
                    key={msg._id}
                    message={msg}
                    isSent={msg.sender?._id === user?._id || msg.sender === user?._id}
                  />
                ))
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mb-2">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Chat input */}
            <div onChange={handleInputChange}>
              <ChatInput onSend={handleSend} disabled={sendingLoading} />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
