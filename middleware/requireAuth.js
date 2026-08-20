const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError(
        'You must be logged in to access this route',
        401
      )
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId =
      decoded.userId ||
      decoded.id ||
      decoded._id;

    if (!userId) {
      return next(
        new AppError(
          'User ID is missing from authentication token',
          401
        )
      );
    }

    req.user = {
      userId: userId.toString(),
      role: decoded.role
    };

    next();
  } catch (error) {
    return next(
      new AppError(
        'Invalid or expired token',
        401
      )
    );
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403
        )
      );
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};