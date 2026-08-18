require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-event', (eventId) => {
    socket.join(eventId);

    console.log(
      `Socket ${socket.id} joined event room: ${eventId}`
    );
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const eventsRoutes = require('./routes/events.routes');
const registrationsRoutes = require('./routes/registrations.routes');
const authRoutes = require('./routes/auth.routes');
const announcementsRoutes = require('./routes/announcements.routes');
const categoriesRoutes = require('./routes/categories.routes');

app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/categories', categoriesRoutes);

app.get('/health', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    res.status(200).json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database:
        mongoose.connection.readyState === 1
          ? 'connected'
          : 'disconnected'
    });
  } catch (error) {
    console.error(
      'Health check database connection failed:',
      error.message
    );

    res.status(503).json({
      status: 'error',
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected'
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

app.httpServer = httpServer;
app.io = io;
app.app = app;

// Connect to MongoDB when running on Vercel
if (process.env.VERCEL) {
  connectDB().catch((error) => {
    console.error('MongoDB connection failed:', error.message);
  });
}

module.exports = app;