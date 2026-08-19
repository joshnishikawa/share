const express = require('express');
const request = require('supertest');
const router = require('../routes/tools');

describe('Tools Router', () => {
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
    app.use('/tools', router);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const routes = [
    { path: '/tools/richtext', view: 'tools/richtext' },
    { path: '/tools/names', view: 'tools/names' },
    { path: '/tools/lp', view: 'tools/lp' },
  ];

  routes.forEach(({ path, view }) => {
    test(`GET ${path} should render ${view} and return 200`, async () => {
      const response = await request(app).get(path);
      expect(response.status).toBe(200);
      expect(app.render).toHaveBeenCalledWith(view, expect.any(Object), expect.any(Function));
    });
  });

  test('should handle render error by returning 500 and rendering error view', async () => {
    renderError = true;
    const response = await request(app).get('/tools/richtext');
    expect(response.status).toBe(500);
    expect(app.render).toHaveBeenCalledWith('error', expect.any(Object), expect.any(Function));
  });
});
