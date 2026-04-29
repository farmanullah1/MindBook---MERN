const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

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

connectDB();

// Socket.io Logic
const User = require('./models/User');

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
    // Update online status
    User.findByIdAndUpdate(userId, { isOnline: true }).exec();
    io.emit('status-updated', { userId, isOnline: true });
  });

  socket.on('send-message', (data) => {
    // data: { conversationId, sender, recipients, message }
    data.recipients.forEach(recipientId => {
      io.to(recipientId).emit('receive-message', data.message);
    });
  });

  socket.on('typing-start', (data) => {
    // data: { conversationId, userId, userName, recipients }
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
    console.log('Client disconnected');
    // We could handle offline status here, but usually it's better to wait a bit 
    // or use a heartbeat to avoid status flickering on page refresh
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
