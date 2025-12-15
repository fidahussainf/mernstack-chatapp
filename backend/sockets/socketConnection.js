import User from '../models/userModel.js';

export const socketConnection = (io) => {
  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Setup user
    socket.on('setup', (userData) => {
      socket.userId = userData._id;
      onlineUsers.set(userData._id, socket.id);

      // Update user online status
      User.findByIdAndUpdate(userData._id, {
        isOnline: true,
        lastSeen: new Date()
      }).catch(err => console.error('Error updating online status:', err));

      socket.join(userData._id);
      socket.emit('connected');
      console.log('User setup:', userData._id);
    });

    // Join chat room
    socket.on('join chat', (chatId) => {
      socket.join(chatId);
      console.log('User joined chat:', chatId);
    });

    // Send message
    socket.on('new message', (messageData) => {
      const chat = messageData.chat;

      if (!chat.users) return console.log('Chat.users not defined');

      chat.users.forEach((user) => {
        if (user._id === messageData.sender._id) return;

        const userSocketId = onlineUsers.get(user._id.toString());
        if (userSocketId) {
          io.to(userSocketId).emit('message received', messageData);
        }
      });
    });

    // Typing indicators
    socket.on('typing', (chatId) => {
      socket.in(chatId).emit('typing', chatId);
    });

    socket.on('stop typing', (chatId) => {
      socket.in(chatId).emit('stop typing', chatId);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      if (socket.userId) {
        onlineUsers.delete(socket.userId);

        // Update user offline status
        User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        }).catch(err => console.error('Error updating offline status:', err));

        // Notify other users about offline status
        socket.broadcast.emit('user offline', socket.userId);
      }
    });
  });
};