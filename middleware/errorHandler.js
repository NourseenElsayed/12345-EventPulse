function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  // Duplicate unique field
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value. This record already exists.';
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,

    // Show stack trace only in development
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
}

module.exports = errorHandler;