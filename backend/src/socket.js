import { Server } from 'socket.io';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('send_message', (data) => {
      io.to(data.conversationId).emit('message_received', data);
    });

    socket.on('typing', (data) => {
      socket.to(data.conversationId).emit('typing', data);
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.conversationId).emit('stop_typing', data);
    });

    socket.on('disconnect', () => {});
  });

  return io;
}
