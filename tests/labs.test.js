const express = require('express');
const request = require('supertest');
const { router, convertSRTtoOBJ, convertOBJtoSRT } = require('../routes/labs');

describe('Labs Router & Helpers', () => {
  describe('SRT helper functions', () => {
    const sampleSRT = '1\n00:00:01,000 --> 00:00:04,000\nHello world\n\n2\n00:00:05,000 --> 00:00:08,000\nSecond line';

    test('convertSRTtoOBJ converts SRT string to object representation', () => {
      const obj = convertSRTtoOBJ(sampleSRT);
      expect(obj['1']).toEqual({
        time: '00:00:01,000 --> 00:00:04,000',
        text: 'Hello world',
      });
      expect(obj['2']).toEqual({
        time: '00:00:05,000 --> 00:00:08,000',
        text: 'Second line',
      });
    });

    test('convertOBJtoSRT converts object back to SRT string', () => {
      const obj = {
        '1': { time: '00:00:01,000 --> 00:00:04,000', text: 'Hello world' },
        '2': { time: '00:00:05,000 --> 00:00:08,000', text: 'Second line' },
      };
      const srt = convertOBJtoSRT(obj);
      expect(srt).toBe(sampleSRT);
    });
  });

  describe('Route handlers', () => {
    let app;
    let renderError = false;
    let consoleErrorSpy;

    beforeEach(() => {
      renderError = false;
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      app = express();
      app.use(express.json());
      app.set('view engine', 'ejs');
      app.render = jest.fn((view, options, callback) => {
        const cb = typeof options === 'function' ? options : callback;
        if (renderError) {
          cb(new Error('Render error'));
        } else {
          cb(null, `Mocked ${view} content`);
        }
      });
      app.use('/labs', router);
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    test('GET /labs/editsubs should return disabled message', async () => {
      const response = await request(app).get('/labs/editsubs');
      expect(response.status).toBe(200);
      expect(response.text).toBe('This route is disabled for now.');
    });

    test('POST /labs/editsubs should return disabled message', async () => {
      const response = await request(app).post('/labs/editsubs').send({ subs: '{}' });
      expect(response.status).toBe(200);
      expect(response.text).toBe('This route is disabled for now.');
    });

    const validActivities = ['snake', 'media'];
    validActivities.forEach(activity => {
      test(`GET /labs/${activity} should render labs/${activity}`, async () => {
        const response = await request(app).get(`/labs/${activity}`);
        expect(response.status).toBe(200);
        expect(app.render).toHaveBeenCalledWith(`labs/${activity}`, expect.any(Object), expect.any(Function));
      });
    });

    test('GET /labs/invalid_activity should return 404 and render 404 view', async () => {
      const response = await request(app).get('/labs/invalid_activity');
      expect(response.status).toBe(404);
      expect(app.render).toHaveBeenCalledWith('404', expect.any(Object), expect.any(Function));
    });
  });
});
