/**
 * CodeDNA
 * server.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const User = require('./models/User');
require('dotenv').config();

const connectDB = require('./config/db');
const { initCleanupJob } = require('./utils/cleanup');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const uploadRoutes = require('./routes/upload');
const notificationRoutes = require('./routes/notifications');
const storyRoutes = require('./routes/stories');
const groupRoutes = require('./routes/groups');
const eventRoutes = require('./routes/events');
const searchRoutes = require('./routes/search');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
});

app.set('io', io);

connectDB();
initCleanupJob();

// Track online users
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    socket.userId = userId; // Store userId on socket for disconnect handler
    
    console.log(`User ${userId} joined their room`);
    
    // Update online status in DB
    User.findByIdAndUpdate(userId, { isOnline: true }).exec();
    
    // Broadcast status to everyone
    io.emit('status-updated', { userId, isOnline: true });
    
    // Send current online users to the joining user
    const onlineList = Array.from(onlineUsers.keys());
    socket.emit('online-users-list', onlineList);
  });

  socket.on('send-message', (data) => {
    data.recipients.forEach(recipientId => {
      io.to(recipientId).emit('receive-message', data.message);
    });
  });

  socket.on('typing-start', (data) => {
    data.recipients.forEach(recipientId => {
      io.to(recipientId).emit('user-typing', data);
    });
  });

  socket.on('typing-stop', (data) => {
    data.recipients.forEach(recipientId => {
      io.to(recipientId).emit('user-stopped-typing', data);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      User.findByIdAndUpdate(socket.userId, { isOnline: false }).exec();
      io.emit('status-updated', { userId: socket.userId, isOnline: false });
    }
  });
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const conversationRoutes = require('./routes/conversations');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/conversations', conversationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MindBook API is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 MindBook API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
