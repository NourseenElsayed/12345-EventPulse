const request = require('supertest');

jest.mock('../models/user.model', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$invalidhash',
    role: 'attendee'
  };

  return {
    findOne: jest.fn(() => ({
      select: jest.fn().mockResolvedValue(null)
    })),
    create: jest.fn().mockResolvedValue(mockUser)
  };
});

const { app } = require('../app');

describe('Authentication API', () => {
  test('POST /api/auth/register should reject invalid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: '',
        email: 'wrong-email',
        password: '123'
      });

    expect(response.statusCode).toBe(422);
    expect(response.body.status).toBe('error');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  test('POST /api/auth/login should reject invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong-email',
        password: '123456'
      });

    expect(response.statusCode).toBe(422);
    expect(response.body.status).toBe('error');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  test('POST /api/auth/login should reject missing password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com'
      });

    expect(response.statusCode).toBe(422);
    expect(response.body.status).toBe('error');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});
