require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const swaggerSpec = require('./config/swagger');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const eventsRoutes = require('./routes/events.routes');
const registrationsRoutes = require('./routes/registrations.routes');
const authRoutes = require('./routes/auth.routes');
const announcementsRoutes = require('./routes/announcements.routes');
const categoriesRoutes = require('./routes/categories.routes');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

// =========================
// Swagger API Documentation
// =========================

app.get('/api-docs', (req, res) => {
  res.redirect('/api-docs/');
});

app.get('/api-docs/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <title>EventPulse API Documentation</title>

  <link
    rel="stylesheet"
    href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
  >

  <style>
    html {
      box-sizing: border-box;
      overflow-y: scroll;
    }

    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }

    body {
      margin: 0;
      background: #fafafa;
    }
  </style>
</head>

<body>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>

  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(swaggerSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: 'StandaloneLayout'
      });
    };
  </script>

</body>
</html>
  `);
});

// =========================
// HTTP Server + Socket.io
// =========================

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

// =========================
// Database Middleware
// =========================

app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    next();
  } catch (error) {
    console.error(
      'MongoDB connection failed:',
      error.message
    );

    return res.status(503).json({
      status: 'error',
      message: 'Database connection failed'
    });
  }
});

// =========================
// Routes
// =========================

app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/categories', categoriesRoutes);

// =========================
// Health Check
// =========================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    database:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected'
  });
});

// =========================
// 404
// =========================

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// =========================
// Error Handler
// =========================

app.use(errorHandler);

// =========================
// Exports
// =========================

app.httpServer = httpServer;
app.io = io;
app.app = app;

module.exports = app;