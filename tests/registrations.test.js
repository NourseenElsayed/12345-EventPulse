const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/registration.model', () => {
  const mockRegistration = {
    _id: '507f1f77bcf86cd799439013',
    event: '507f1f77bcf86cd799439012',
    attendee: '507f1f77bcf86cd799439011',
    deleteOne: jest.fn().mockResolvedValue(true)
  };

  return {
    create: jest.fn().mockResolvedValue(mockRegistration),

    find: jest.fn(() => ({
      populate: jest.fn().mockResolvedValue([mockRegistration])
    })),

    findOne: jest.fn().mockResolvedValue(null),

    countDocuments: jest.fn().mockResolvedValue(0),

    findById: jest.fn().mockResolvedValue(mockRegistration)
  };
});

jest.mock('../models/event.model', () => {
  return {
    findById: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439012',
      title: 'Test Event',
      capacity: 100
    })
  };
});

const { app } = require('../app');

describe('Registrations API Integration Tests', () => {

  const token = jwt.sign(
    {
      userId: '507f1f77bcf86cd799439011',
      role: 'attendee'
    },
    process.env.JWT_SECRET
  );

  test('POST /api/registrations should reject unauthenticated request', async () => {
    const response = await request(app)
      .post('/api/registrations')
      .send({
        eventId: '507f1f77bcf86cd799439012'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe('fail');
  });

  test('POST /api/registrations should validate eventId', async () => {
    const response = await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        eventId: 'invalid-id'
      });

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe('Validation failed');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  test('POST /api/registrations should create registration', async () => {
    const response = await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        eventId: '507f1f77bcf86cd799439012'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toBeDefined();
  });

  test('GET /api/registrations/my should require authentication', async () => {
    const response = await request(app)
      .get('/api/registrations/my');

    expect(response.statusCode).toBe(401);
  });

  test('GET /api/registrations/my should return user registrations', async () => {
    const response = await request(app)
      .get('/api/registrations/my')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('DELETE /api/registrations/:id should reject unauthenticated request', async () => {
    const response = await request(app)
      .delete('/api/registrations/507f1f77bcf86cd799439013');

    expect(response.statusCode).toBe(401);
  });

  test('DELETE /api/registrations/:id should cancel own registration', async () => {
    const response = await request(app)
      .delete('/api/registrations/507f1f77bcf86cd799439013')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe(
      'Registration cancelled successfully'
    );
  });

});
