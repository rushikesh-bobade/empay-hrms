const { Server } = require('socket.io');
const { pool } = require('./db');

let io;
const userSockets = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('register', (userId) => {
      const uId = String(userId);
      userSockets.set(uId, socket.id);
      // Broadcast online status
      io.emit('user_status', { userId: uId, status: 'online' });
      // Send the user the full online list
      const onlineUsers = Array.from(userSockets.keys());
      socket.emit('online_users', onlineUsers);
    });

    socket.on('private_message', async (data) => {
      const { targetId, text, senderId } = data;
      // Persist message in DB
      try {
        const result = await pool.query(
          `INSERT INTO messages (sender_id, receiver_id, text) VALUES ($1, $2, $3) RETURNING *`,
          [senderId, targetId, text]
        );
        const saved = result.rows[0];
        const payload = {
          id: saved.id,
          senderId: saved.sender_id,
          receiverId: saved.receiver_id,
          text: saved.text,
          timestamp: saved.created_at,
        };

        // Send to target if online
        const targetSocket = userSockets.get(String(targetId));
        if (targetSocket) {
          io.to(targetSocket).emit('private_message', payload);
        }
        // Send confirmation back to sender
        socket.emit('message_sent', payload);
      } catch (err) {
        console.error('Error persisting message:', err.message);
        // Still relay even if DB fails
        const targetSocket = userSockets.get(String(targetId));
        if (targetSocket) {
          io.to(targetSocket).emit('private_message', data);
        }
      }
    });

    socket.on('mark_read', async (data) => {
      const { userId, senderId } = data;
      try {
        await pool.query(
          `UPDATE messages SET is_read = true WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false`,
          [userId, senderId]
        );
      } catch (err) {
        console.error('Error marking messages read:', err.message);
      }
    });

    socket.on('typing', (data) => {
      const targetSocket = userSockets.get(String(data.targetId));
      if (targetSocket) {
        io.to(targetSocket).emit('typing', { senderId: data.senderId });
      }
    });

    socket.on('stop_typing', (data) => {
      const targetSocket = userSockets.get(String(data.targetId));
      if (targetSocket) {
        io.to(targetSocket).emit('stop_typing', { senderId: data.senderId });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      for (const [userId, sockId] of userSockets.entries()) {
        if (sockId === socket.id) {
          userSockets.delete(userId);
          io.emit('user_status', { userId, status: 'offline' });
          break;
        }
      }
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const getOnlineUsers = () => Array.from(userSockets.keys());

module.exports = { initSocket, getIo, getOnlineUsers };
