import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// In-memory room store
const rooms = {};

// REST endpoint to create a room
app.post('/create-room', (req, res) => {
  const roomKey = uuidv4().slice(0, 6);
  // adminId will be set on first join
  rooms[roomKey] = { users: [], messages: [], adminId: null, createdAt: Date.now(), poll: null };
  res.json({ roomKey });
});

// REST endpoint to validate if a room exists
app.get('/validate-room/:roomKey', (req, res) => {
  const { roomKey } = req.params;
  res.json({ exists: !!rooms[roomKey] });
});

io.on('connection', (socket) => {
  socket.on('join_room', ({ username, roomKey }) => {
    if (!rooms[roomKey]) {
      socket.emit('join_error', { message: 'Room does not exist.' });
      return;
    }
    // If first user, make admin
    if (!rooms[roomKey].adminId) {
      rooms[roomKey].adminId = socket.id;
    }
    // Assign avatar color and initials
    const colors = ["#1E88E5", "#43A047", "#F4511E", "#8E24AA", "#FDD835", "#D81B60", "#3949AB", "#00897B", "#6D4C41", "#C0CA33"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const initials = username.trim().slice(0,2).toUpperCase();
    rooms[roomKey].users.push({ id: socket.id, username, avatarColor: color, initials });
    socket.join(roomKey);
    // Always send the full messages array, including all announcements
    socket.emit('chat_history', rooms[roomKey].messages);
    // Send session timer info
    socket.emit('room_info', { createdAt: rooms[roomKey].createdAt, poll: rooms[roomKey].poll });
    const joinMsg = {
      type: 'system',
      message: `${username} joined the chat`,
      timestamp: new Date(),
      userCount: rooms[roomKey].users.length
    };
    rooms[roomKey].messages.push(joinMsg);
    // Emit user list and admin info to all
    io.to(roomKey).emit('user_list', { users: rooms[roomKey].users, adminId: rooms[roomKey].adminId });
    io.to(roomKey).emit('user_joined', { username, userCount: rooms[roomKey].users.length });
    io.to(roomKey).emit('receive_message', joinMsg );
  });

  socket.on('send_message', ({ roomKey, username, message }) => {
    if (rooms[roomKey]) {
      const msgObj = { type: 'user', username, message, timestamp: new Date() };
      rooms[roomKey].messages.push(msgObj);
      io.to(roomKey).emit('receive_message', msgObj);
    }
  });

  // Admin-only: send announcement
  socket.on('send_announcement', ({ roomKey, message }) => {
    if (!rooms[roomKey] || rooms[roomKey].adminId !== socket.id) return;
    const ann = {
      type: 'announcement',
      message,
      timestamp: new Date(),
      username: 'Admin'
    };
    rooms[roomKey].messages.push(ann);
    io.to(roomKey).emit('announcement', ann);
    // Also emit as a normal chat message so it appears in chat history for everyone
    io.to(roomKey).emit('receive_message', ann);
  });

  // Typing indicator
  socket.on('typing', ({ roomKey, username }) => {
    socket.to(roomKey).emit('user_typing', { username });
  });
  socket.on('stop_typing', ({ roomKey, username }) => {
    socket.to(roomKey).emit('user_stop_typing', { username });
  });

  // Polls
  socket.on('create_poll', ({ roomKey, question, options }) => {
    if (!rooms[roomKey] || rooms[roomKey].adminId !== socket.id) return;
    const poll = {
      question,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      votes: {}, // userId: optionIdx
      active: true
    };
    rooms[roomKey].poll = poll;
    io.to(roomKey).emit('poll_created', poll);
  });
  socket.on('vote_poll', ({ roomKey, optionIdx }) => {
    const room = rooms[roomKey];
    if (!room || !room.poll || !room.poll.active) return;
    room.poll.votes[socket.id] = optionIdx;
    // Recount votes
    room.poll.options.forEach(opt => opt.votes = 0);
    Object.values(room.poll.votes).forEach(idx => {
      if (room.poll.options[idx]) room.poll.options[idx].votes++;
    });
    io.to(roomKey).emit('poll_updated', room.poll);
  });
  socket.on('close_poll', ({ roomKey }) => {
    const room = rooms[roomKey];
    if (!room || !room.poll || room.adminId !== socket.id) return;
    room.poll.active = false;
    io.to(roomKey).emit('poll_updated', room.poll);
  });

  socket.on('leave_room', ({ roomKey, username }) => {
    socket.leave(roomKey);
    if (rooms[roomKey]) {
      rooms[roomKey].users = rooms[roomKey].users.filter(u => u.id !== socket.id);
      // If admin left, promote next user or null
      if (rooms[roomKey].adminId === socket.id) {
        rooms[roomKey].adminId = rooms[roomKey].users[0]?.id || null;
      }
      const exitMsg = {
        type: 'system',
        message: `${username} exited the chat`,
        timestamp: new Date(),
        userCount: rooms[roomKey].users.length
      };
      rooms[roomKey].messages.push(exitMsg);
      io.to(roomKey).emit('user_left', { username, userCount: rooms[roomKey].users.length });
      io.to(roomKey).emit('receive_message', exitMsg);
      // Emit updated user list and admin info
      io.to(roomKey).emit('user_list', { users: rooms[roomKey].users, adminId: rooms[roomKey].adminId });
      if (rooms[roomKey].users.length === 0) {
        delete rooms[roomKey];
      }
    }
  });

  socket.on('disconnect', () => {
    for (const [roomKey, room] of Object.entries(rooms)) {
      const user = room.users.find(u => u.id === socket.id);
      if (user) {
        room.users = room.users.filter(u => u.id !== socket.id);
        // If admin left, promote next user or null
        if (room.adminId === socket.id) {
          room.adminId = room.users[0]?.id || null;
        }
        const exitMsg = {
          type: 'system',
          message: `${user.username} exited the chat`,
          timestamp: new Date(),
          userCount: room.users.length
        };
        room.messages.push(exitMsg);
        io.to(roomKey).emit('user_left', { username: user.username, userCount: room.users.length });
        io.to(roomKey).emit('receive_message', exitMsg);
        // Emit updated user list and admin info
        io.to(roomKey).emit('user_list', { users: room.users, adminId: room.adminId });
        if (room.users.length === 0) {
          delete rooms[roomKey];
        }
        break;
      }
    }
  });

  // Admin-only: remove user from room
  socket.on('remove_user', ({ roomKey, targetId }) => {
    if (!rooms[roomKey]) return;
    // Only admin can remove
    if (rooms[roomKey].adminId !== socket.id) return;
    const user = rooms[roomKey].users.find(u => u.id === targetId);
    if (!user) return;
    // Remove user from room
    rooms[roomKey].users = rooms[roomKey].users.filter(u => u.id !== targetId);
    io.to(targetId).emit('removed', { message: 'You have been removed from the chat by the admin.' });
    io.sockets.sockets.get(targetId)?.leave(roomKey);
    const exitMsg = {
      type: 'system',
      message: `${user.username} was removed by the admin`,
      timestamp: new Date(),
      userCount: rooms[roomKey].users.length
    };
    rooms[roomKey].messages.push(exitMsg);
    io.to(roomKey).emit('user_left', { username: user.username, userCount: rooms[roomKey].users.length });
    io.to(roomKey).emit('receive_message', exitMsg);
    io.to(roomKey).emit('user_list', { users: rooms[roomKey].users, adminId: rooms[roomKey].adminId });
    if (rooms[roomKey].users.length === 0) {
      delete rooms[roomKey];
    }
  });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
