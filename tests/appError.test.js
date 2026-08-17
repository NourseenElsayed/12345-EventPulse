const AppError = require('../utils/AppError');

describe('AppError', () => {
  test('creates an error successfully', () => {
    const error = new AppError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
  });

  test('creates a server error correctly', () => {
    const error = new AppError('Server error', 500);

    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
  });
});
