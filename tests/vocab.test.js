const express = require('express');
const request = require('supertest');
const router = require('../routes/vocab');
const db = require('../config/db');

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

jest.mock('../public/vocabulary.js', () => ([
  { id: 1, word: 'dog', meaning: 'inu', image: 'dog.svg' },
  { id: 2, word: 'cat', meaning: 'neko', image: 'cat.svg' },
  { id: 3, word: 'bird', meaning: 'tori', image: 'bird.svg' },
]));

describe('Vocab Router', () => {
  let app;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.set('view engine', 'ejs');
    app.render = jest.fn((view, options, callback) => {
      const cb = typeof options === 'function' ? options : callback;
      cb(null, `Mocked ${view} content`);
    });
    app.use('/vocab', router);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('GET /vocab/:activity', () => {
    test('should render 404 view', async () => {
      const response = await request(app).get('/vocab/flash');
      expect(response.status).toBe(200);
      expect(app.render).toHaveBeenCalledWith('404', expect.any(Object), expect.any(Function));
    });
  });

  describe('GET /vocab/:activity/:id', () => {
    test('should render 404 for invalid activity name', async () => {
      const response = await request(app).get('/vocab/unsupported_act/123');
      expect(response.status).toBe(200);
      expect(app.render).toHaveBeenCalledWith('404', expect.any(Object), expect.any(Function));
    });

    test('should render 404 if link is not found in database', async () => {
      db.query.mockResolvedValueOnce([[]]); // empty rows

      const response = await request(app).get('/vocab/flash/999');
      expect(response.status).toBe(200);
      expect(app.render).toHaveBeenCalledWith('404', expect.any(Object), expect.any(Function));
    });

    test('should render activity for text deckType', async () => {
      db.query.mockResolvedValueOnce([
        [{ id: 10, activity: 'flash', deckType: 'text', deck: JSON.stringify(['apple', 'banana']) }],
      ]);

      const response = await request(app).get('/vocab/flash/10?mode=test');
      expect(response.status).toBe(200);
      expect(app.render).toHaveBeenCalledWith('activities/vocab/flash', expect.objectContaining({
        deckType: 'text',
        deck: ['apple', 'banana'],
        query: { mode: 'test' },
      }), expect.any(Function));
    });

    test('should render activity for vocab ID list deckType', async () => {
      db.query.mockResolvedValueOnce([
        [{ id: 20, activity: 'match', deckType: 'nh', deck: JSON.stringify([2, 1]) }],
      ]);

      const response = await request(app).get('/vocab/match/20');
      expect(response.status).toBe(200);
      expect(app.render).toHaveBeenCalledWith('activities/vocab/match', expect.objectContaining({
        deckType: 'nh',
        deck: [
          { id: 2, word: 'cat', meaning: 'neko', image: 'cat.svg' },
          { id: 1, word: 'dog', meaning: 'inu', image: 'dog.svg' },
        ],
      }), expect.any(Function));
    });
  });

  describe('POST /vocab/:activity', () => {
    test('should render 404 for invalid activity or malformed deck JSON', async () => {
      const response = await request(app)
        .post('/vocab/invalid_activity')
        .send({ deck: 'not-json' });
      expect(response.status).toBe(200);
      expect(app.render).toHaveBeenCalledWith('404', expect.any(Object), expect.any(Function));
    });

    test('should render directly for nolink deckType', async () => {
      const deckData = [{ word: 'test', meaning: 'test' }];
      const response = await request(app)
        .post('/vocab/flash')
        .send({ deckType: 'nolink', deck: JSON.stringify(deckData), foo: 'bar' });

      expect(response.status).toBe(200);
      expect(app.render).toHaveBeenCalledWith('activities/vocab/flash', expect.objectContaining({
        deckType: 'nolink',
        deck: deckData,
        query: { foo: 'bar' },
      }), expect.any(Function));
    });

    test('should redirect to existing link if found in db', async () => {
      db.query.mockResolvedValueOnce([
        [{ id: 42 }],
      ]);

      const response = await request(app)
        .post('/vocab/flash')
        .send({ deckType: 'text', deck: JSON.stringify(['a']), theme: 'fruit' });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/vocab/flash/42?theme=fruit');
    });

    test('should insert and redirect to new link if not existing in db', async () => {
      db.query
        .mockResolvedValueOnce([[]]) // SELECT returns empty
        .mockResolvedValueOnce([{ insertId: 99 }]); // INSERT returns new id

      const response = await request(app)
        .post('/vocab/flash')
        .send({ deckType: 'text', deck: JSON.stringify(['a']), theme: 'fruit' });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/vocab/flash/99?theme=fruit');
    });
  });
});
