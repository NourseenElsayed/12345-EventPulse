const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/category.model', () => {
  const mockCategory = {
    _id: '507f1f77bcf86cd799439015',
    name: 'Technology',
    description: 'Technology events'
  };

  return {
    find: jest.fn(() => ({
      sort: jest.fn().mockResolvedValue([mockCategory])
    })),

    findOne: jest.fn().mockResolvedValue(null),

    create: jest.fn().mockResolvedValue(mockCategory)
  };
});

const { app } = require('../app');

describe('Categories API Integration Tests', () => {

  const attendeeToken = jwt.sign(
    {
      userId: '507f1f77bcf86cd799439011',
      role: 'attendee'
    },
    process.env.JWT_SECRET
  );

  const adminToken = jwt.sign(
    {
      userId: '507f1f77bcf86cd799439016',
      role: 'admin'
    },
    process.env.JWT_SECRET
  );

  test('GET /api/categories should return categories', async () => {
    const response = await request(app)
      .get('/api/categories');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/categories should reject unauthenticated request', async () => {
    const response = await request(app)
      .post('/api/categories')
      .send({
        name: 'Technology'
      });

    expect(response.statusCode).toBe(401);
  });

  test('POST /api/categories should reject attendee', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${attendeeToken}`)
      .send({
        name: 'Technology'
      });

    expect(response.statusCode).toBe(403);
  });

  test('POST /api/categories should validate name', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: ''
      });

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe('Validation failed');
  });

  test('POST /api/categories should create category for admin', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Technology',
        description: 'Technology events'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toBeDefined();
  });

});
