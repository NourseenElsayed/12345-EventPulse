jest.mock('../models/event.model', () => {
  const mockEvent = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Event',
    description: 'Test event description',
    category: '507f1f77bcf86cd799439012',
    date: new Date('2026-12-01'),
    city: 'Cairo',
    venue: 'Test Venue',
    capacity: 100
  };

  return {
    find: jest.fn(() => ({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([mockEvent])
    })),

    countDocuments: jest.fn().mockResolvedValue(1),

    findById: jest.fn(() => ({
      populate: jest.fn().mockReturnThis(),
      then: (resolve) => resolve(mockEvent)
    })),

    create: jest.fn().mockResolvedValue(mockEvent),

    findByIdAndUpdate: jest.fn(() => ({
      populate: jest.fn().mockReturnThis(),
      then: (resolve) => resolve(mockEvent)
    })),

    findByIdAndDelete: jest.fn().mockResolvedValue(mockEvent)
  };
});

jest.mock('../models/user.model', () => ({
  findOne: jest.fn().mockResolvedValue({
    _id: '507f1f77bcf86cd799439013',
    role: 'admin'
  })
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');

const { app } = require('../app');

describe('Events API Integration Tests', () => {
  const adminToken = jwt.sign(
    {
      userId: '507f1f77bcf86cd799439013',
      role: 'admin'
    },
    process.env.JWT_SECRET
  );

  test('GET /api/events should return events list', async () => {
    const response = await request(app)
      .get('/api/events');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('limit');
    expect(response.body).toHaveProperty('totalPages');
  });

  test('GET /api/events/:id should return a specific event', async () => {
    const response = await request(app)
      .get('/api/events/507f1f77bcf86cd799439011');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('_id');
  });

  test('POST /api/events should reject invalid data with 422', async () => {
    const response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '',
        description: '',
        category: 'invalid-id',
        date: 'invalid-date',
        city: '',
        venue: '',
        capacity: 0
      });

    expect(response.statusCode).toBe(422);
    expect(response.body).toHaveProperty('errors');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});
