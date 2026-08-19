const express = require('express');
const request = require('supertest');
const router = require('../routes/api');
const pool = require('../config/db');

jest.mock('../config/db', () => ({
  getConnection: jest.fn(),
}));

jest.mock('../config/nh_helpers', () => ({
  NH_colors: { '8_9': 'green' },
  getNHVocab: jest.fn().mockResolvedValue({
    '8_9': { feelings: { happy: 1 } },
  }),
}));

jest.mock('../public/vocabulary.js', () => ([
  { id: 1, word: 'dog', meaning: 'inu', image: 'dog.svg', audio: 'dog.mp3' },
  { id: 2, word: 'cat', meaning: 'neko', image: 'cat.svg', audio: 'cat.mp3' },
]));

describe('API Router', () => {
  let app;
  let mockUser = null;
  let isAuth = false;
  let mockConnection;

  beforeEach(() => {
    jest.clearAllMocks();
    isAuth = false;
    mockUser = null;

    mockConnection = {
      execute: jest.fn(),
      release: jest.fn(),
    };
    pool.getConnection.mockResolvedValue(mockConnection);

    app = express();
    app.use(express.json());
    // Mock passport authentication middleware and i18n
    app.use((req, res, next) => {
      req.isAuthenticated = () => isAuth;
      req.user = mockUser;
      req.__ = (str) => `translated_${str}`;
      next();
    });
    app.use('/api', router);
  });

  describe('GET /api/user', () => {
    test('returns authenticated: false when unauthenticated', async () => {
      isAuth = false;
      const response = await request(app).get('/api/user');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        authenticated: false,
        user: null,
      });
    });

    test('returns user details when authenticated', async () => {
      isAuth = true;
      mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile_picture: 'https://example.com/pic.jpg',
      };

      const response = await request(app).get('/api/user');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        authenticated: true,
        user: mockUser,
      });
    });
  });

  describe('GET /api/any-vocab', () => {
    test('returns full vocabulary dictionary when no deck query is passed', async () => {
      const response = await request(app).get('/api/any-vocab');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        dog: { meaning: 'inu', image: 'dog.svg', audio: 'dog.mp3' },
        cat: { meaning: 'neko', image: 'cat.svg', audio: 'cat.mp3' },
      });
    });

    test('filters vocabulary by deck array if provided', async () => {
      const response = await request(app).get('/api/any-vocab?deck=[1]');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        dog: { meaning: 'inu', image: 'dog.svg', audio: 'dog.mp3' },
      });
    });
  });

  describe('GET /api/nh-vocab', () => {
    test('returns NH vocabulary with translations and colors', async () => {
      const response = await request(app).get('/api/nh-vocab');
      expect(response.status).toBe(200);
      expect(response.body.translations).toEqual({ feelings: 'translated_feelings' });
      expect(response.body.NH_colors).toEqual({ '8_9': 'green' });
    });
  });

  describe('GET /api/sync/canvas/:key', () => {
    test('returns 401 if unauthenticated', async () => {
      isAuth = false;
      const response = await request(app).get('/api/sync/canvas/shapes');
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authenticated');
    });

    test('returns 400 for invalid storage key', async () => {
      isAuth = true;
      mockUser = { id: 1 };
      const response = await request(app).get('/api/sync/canvas/invalid_key');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid storage key');
    });

    test('returns stored canvas data if found', async () => {
      isAuth = true;
      mockUser = { id: 1 };
      mockConnection.execute.mockResolvedValueOnce([
        [{ data: JSON.stringify({ item1: 'test' }), updated_at: '2026-08-19T00:00:00.000Z' }],
      ]);

      const response = await request(app).get('/api/sync/canvas/shapes');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ item1: 'test' });
      expect(mockConnection.release).toHaveBeenCalled();
    });

    test('returns null data when no canvas record found', async () => {
      isAuth = true;
      mockUser = { id: 1 };
      mockConnection.execute.mockResolvedValueOnce([[]]);

      const response = await request(app).get('/api/sync/canvas/shapes');
      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.updated_at).toBeNull();
    });
  });

  describe('POST /api/sync/canvas/:key', () => {
    beforeEach(() => {
      isAuth = true;
      mockUser = { id: 1 };
    });

    test('returns 400 if missing data field', async () => {
      const response = await request(app)
        .post('/api/sync/canvas/shapes')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing data field');
    });

    test('returns 400 if too many array items', async () => {
      const response = await request(app)
        .post('/api/sync/canvas/shapes')
        .send({ data: new Array(15).fill('item') });
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Too many canvas items');
    });

    test('saves canvas data successfully', async () => {
      mockConnection.execute.mockResolvedValueOnce([{}]);

      const response = await request(app)
        .post('/api/sync/canvas/shapes')
        .send({ data: ['item1', 'item2'] });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockConnection.execute).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });
  });

  describe('GET /api/preferences/:key', () => {
    beforeEach(() => {
      isAuth = true;
      mockUser = { id: 1 };
    });

    test('returns 400 for invalid preference key format', async () => {
      const response = await request(app).get('/api/preferences/invalid%20key!');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid preference key format');
    });

    test('returns preference value when found', async () => {
      mockConnection.execute.mockResolvedValueOnce([
        [{ pref_value: 'dark_theme', updated_at: '2026-08-19T00:00:00.000Z' }],
      ]);

      const response = await request(app).get('/api/preferences/theme');
      expect(response.status).toBe(200);
      expect(response.body.value).toBe('dark_theme');
    });
  });

  describe('POST /api/preferences/:key', () => {
    beforeEach(() => {
      isAuth = true;
      mockUser = { id: 1 };
    });

    test('returns 400 for missing/invalid value', async () => {
      const response = await request(app)
        .post('/api/preferences/theme')
        .send({ value: 123 });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing or invalid value field');
    });

    test('saves user preference successfully', async () => {
      mockConnection.execute.mockResolvedValueOnce([{}]);

      const response = await request(app)
        .post('/api/preferences/theme')
        .send({ value: 'dark' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockConnection.execute).toHaveBeenCalled();
    });
  });
});
