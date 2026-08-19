const mongoose = require('mongoose');

let connectionPromise = null;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }

    // If a connection is already in progress,
    // wait for the same connection instead of creating another one.
    if (connectionPromise) {
      return await connectionPromise;
    }

    console.log('Attempting MongoDB connection...');

    console.log(
      'Mongo URI:',
      process.env.MONGO_URI?.replace(/\/\/.*@/, '//***@')
    );

    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      dbName: 'test',
      serverSelectionTimeoutMS: 10000
    });

    await connectionPromise;

    console.log('MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);

    connectionPromise = null;
  } catch (error) {
    connectionPromise = null;

    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;