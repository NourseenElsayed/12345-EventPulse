require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { httpServer } = require('./app');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
