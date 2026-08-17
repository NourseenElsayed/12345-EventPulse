const request = require('supertest');

jest.mock('../models/message.model', () => {
  const mockMessage = {
    _id: '507f1f77bcf86cd799439014',
    event: '507f1f77bcf86cd799439012',
    sender: '507f1f77bcf86cd799439011',
    text: 'Test announcement',
    createdAt: new Date('2026-08-17')
  };

  return {
    create: jest.fn().mockResolvedValue(mockMessage),

    findById: jest.fn(() => ({
      populate: jest.fn().mockResolvedValue(mockMessage)
    })),

    find: jest.fn(() => ({
      populate: jest.fn(() => ({
        sort: jest.fn().mockResolvedValue([mockMessage])
      }))
    }))
  };
});

jest.mock('../models/event.model', () => ({
  findById: jest.fn().mockResolvedValue({
    _id: '507f1f77bcf86cd799439012',
    title: 'Test Event'
  })
}));

const { app } = require('../app');

describe('Announcements API Integration Tests', () => {

  test('GET /api/announcements/invalid-id should return 400', async () => {
    const response = await request(app)
      .get('/api/announcements/invalid-id');

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid event ID');
  });

  test('GET /api/announcements/:eventId should return announcements', async () => {
    const response = await request(app)
      .get('/api/announcements/507f1f77bcf86cd799439012');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.count).toBe(1);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/announcements without authentication should return 401', async () => {
    const response = await request(app)
      .post('/api/announcements')
      .send({
        eventId: '507f1f77bcf86cd799439012',
        text: 'Test announcement'
      });

    expect(response.statusCode).toBe(401);
  });

  test('POST /api/announcements with invalid data should return 401 without authentication', async () => {
    const response = await request(app)
      .post('/api/announcements')
      .send({
        eventId: 'invalid-id',
        text: ''
      });

    expect(response.statusCode).toBe(401);
  });

});
