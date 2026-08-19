const express = require('express');
const request = require('supertest');
const router = require('../routes/multiplayer/index');

describe('Multiplayer Router', () => {
  let app;
  let renderError = false;
  let consoleErrorSpy;

  beforeEach(() => {
    renderError = false;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    app = express();
    app.set('view engine', 'ejs');
    app.render = jest.fn((view, options, callback) => {
      const cb = typeof options === 'function' ? options : callback;
      if (renderError) {
        throw new Error('Synchronous render exception');
      }
      cb(null, `Mocked ${view} content`);
    });
    app.use('/multiplayer', router);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('GET /multiplayer should render students/multiplayer with enabled activities', async () => {
    const response = await request(app).get('/multiplayer');
    expect(response.status).toBe(200);
    expect(app.render).toHaveBeenCalledWith('students/multiplayer', expect.objectContaining({
      activities: expect.any(Array),
    }), expect.any(Function));
  });

  test('GET /multiplayer/race should render race index', async () => {
    const response = await request(app).get('/multiplayer/race');
    expect(response.status).toBe(200);
    expect(app.render).toHaveBeenCalledWith('activities/multiplayer/race/index', expect.any(Object), expect.any(Function));
  });

  test('GET /multiplayer/choose should render choose index', async () => {
    const response = await request(app).get('/multiplayer/choose');
    expect(response.status).toBe(200);
    expect(app.render).toHaveBeenCalledWith('activities/multiplayer/choose/index', expect.any(Object), expect.any(Function));
  });

  test('GET /multiplayer/match should render match index', async () => {
    const response = await request(app).get('/multiplayer/match');
    expect(response.status).toBe(200);
    expect(app.render).toHaveBeenCalledWith('activities/multiplayer/match/index', expect.any(Object), expect.any(Function));
  });

  test('should handle render errors by returning 500 and error view', async () => {
    renderError = true;
    const response = await request(app).get('/multiplayer');
    expect(response.status).toBe(500);
    expect(app.render).toHaveBeenCalledWith('error', expect.any(Object), expect.any(Function));
  });
});
