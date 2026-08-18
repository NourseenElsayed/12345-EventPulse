const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }

    console.log('Attempting MongoDB connection...');

    console.log(
      'Mongo URI:',
      process.env.MONGO_URI?.replace(/\/\/.*@/, '//***@')
    );

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;