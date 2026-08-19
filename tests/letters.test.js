const express = require('express');
const request = require('supertest');
const router = require('../routes/letters');

describe('Letters Router', () => {
  let app;
  let renderError = false;

  beforeEach(() => {
    renderError = false;
    app = express();
    app.set('view engine', 'ejs');
    app.render = jest.fn((view, options, callback) => {
      const cb = typeof options === 'function' ? options : callback;
      if (renderError) {
        cb(new Error('Render error'));
      } else {
        cb(null, `Mocked ${view} content`);
      }
    });
    app.use('/letters', router);
    app.use((err, req, res, next) => {
      res.status(500).send(err.message || 'Internal Server Error');
    });
  });

  const routes = [
    { path: '/letters', view: 'students/letters' },
    { path: '/letters/pairs', view: 'activities/letters/pairs' },
    { path: '/letters/haystack', view: 'activities/letters/haystack' },
    { path: '/letters/alphabetical', view: 'activities/letters/alphabetical' },
    { path: '/letters/penmanship', view: 'activities/letters/penmanship' },
    { path: '/letters/SRS_abc', view: 'activities/letters/SRS_abc' },
    { path: '/letters/SRS_bl', view: 'activities/letters/SRS_bl' },
    { path: '/letters/SRS_3L', view: 'activities/letters/SRS_3L' },
    { path: '/letters/SRS_h', view: 'activities/letters/SRS_h' },
    { path: '/letters/SRS_e', view: 'activities/letters/SRS_e' },
  ];

  routes.forEach(({ path, view }) => {
    test(`GET ${path} should render ${view} and return 200`, async () => {
      const response = await request(app).get(path);
      expect(response.status).toBe(200);
      expect(app.render).toHaveBeenCalledWith(view, expect.any(Object), expect.any(Function));
    });
  });

  test('should pass error to next middleware when render fails', async () => {
    renderError = true;
    const response = await request(app).get('/letters/pairs');
    expect(response.status).toBe(500);
    expect(response.text).toBe('Render error');
  });
});
