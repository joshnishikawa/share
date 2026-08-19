const express = require('express');
const request = require('supertest');
const router = require('../routes/media');
const fs = require('fs');
const path = require('path');

// Mock the fs module
jest.mock('fs');
jest.mock('path');

// Global flag to control app.render's error behavior for specific tests
let renderErrorForFirstCall = false;

// Setup Express app
const app = express();
app.use(express.json()); // Needed for POST requests with JSON body
app.set('view engine', 'ejs');
app.render = jest.fn((view, options, callback) => {
  if (renderErrorForFirstCall) {
    renderErrorForFirstCall = false; // Reset immediately after first error
    callback(new Error('Forced render error'));
  } else {
    callback(null, `Mocked ${view} content`);
  }
});
app.use('/', router);

// Add an error handling middleware to catch errors passed to next(err)
app.use((err, req, res, next) => {
  res.status(500).send(err.message || 'Internal Server Error');
});

describe('Media Router', () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    renderErrorForFirstCall = false; // Reset error flag for other tests

    // Suppress console.error and console.log during tests to prevent noise
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Default mock implementations
    fs.readFileSync.mockReturnValue('{}'); // Default to empty JSON for tags
    fs.readdirSync.mockReturnValue([]);    // Default to empty directory
    fs.writeFileSync.mockReturnValue(undefined); // No error on write
    fs.existsSync.mockReturnValue(false);  // Default to file not existing

    // Reset path.join mock to its original implementation for easier debugging unless specifically mocked
    path.join.mockImplementation(jest.requireActual('path').join);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore(); // Restore console.error
    consoleLogSpy.mockRestore();   // Restore console.log
  });

  describe('GET /', () => {
    test('should render labs/media and return 200', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(app.render).toHaveBeenCalledWith('labs/media', expect.any(Object), expect.any(Function));
      expect(app.render).toHaveBeenCalledTimes(1);
    });

    test('should return 500 on render error', async () => {
      renderError = true; // Force the first app.render call to throw an error
      const response = await request(app).get('/');
      expect(response.status).toBe(500);
      expect(response.text).toBe('Forced render error'); // Expect the error message from the middleware
    });
  });

  describe('GET /files', () => {
    test('should return files and tags', async () => {
      const mockTags = { 'tag1': ['file1', 'file2'], 'tag2': ['file1'] };
      const mockFilenames = ['file1.svg', 'file2.svg', 'README.md', '.git', '_tags.json'];
      
      fs.readFileSync.mockReturnValueOnce(JSON.stringify(mockTags));
      fs.readdirSync.mockReturnValueOnce(mockFilenames);
      
      const response = await request(app).get('/files');
      expect(response.status).toBe(200);
      expect(response.body.files).toEqual({
        'file1': ['tag1', 'tag2'],
        'file2': ['tag1'],
      });
      expect(response.body.tags).toEqual(mockTags);
      expect(fs.readFileSync).toHaveBeenCalledWith(path.join(__dirname, '../public/image/svg/_tags.json'));
      expect(fs.readdirSync).toHaveBeenCalledWith(path.join(__dirname, '../public/image/svg'));
    });

    test('should return 500 on error', async () => {
      fs.readFileSync.mockImplementation(() => { throw new Error('File read error'); });
      const response = await request(app).get('/files');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({}); // Assuming it sends an empty object on error
    });
  });

  describe('POST /addTags', () => {
    test('should add new tags to files and write to file', async () => {
      const initialTags = { 'existingTag': ['fileA'] };
      fs.readFileSync.mockReturnValueOnce(JSON.stringify(initialTags)); // Read initial tags
      
      const selectedTags = ['newTag', 'existingTag'];
      const selectedFiles = ['fileA', 'fileB'];

      const expectedTags = {
        'existingTag': ['fileA', 'fileB'],
        'newTag': ['fileA', 'fileB'],
      };

      const response = await request(app)
        .post('/addTags')
        .send({ selectedTags, selectedFiles });
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('success');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(__dirname, '../public/image/svg/_tags.json'),
        JSON.stringify(expectedTags)
      );
    });

    test('should return 500 on error', async () => {
      fs.readFileSync.mockImplementation(() => { throw new Error('File read error'); });
      const response = await request(app)
        .post('/addTags')
        .send({ selectedTags: ['tag'], selectedFiles: ['file'] });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({});
    });
  });

  describe('POST /removeTags', () => {
    test('should remove tags from files and write to file', async () => {
      const initialTags = { 'tag1': ['file1', 'file2', 'file3'], 'tag2': ['file1'] };
      fs.readFileSync.mockReturnValueOnce(JSON.stringify(initialTags));
      
      const selectedTags = ['tag1'];
      const selectedFiles = ['file2'];

      const expectedTags = {
        'tag1': ['file1', 'file3'],
        'tag2': ['file1'],
      };

      const response = await request(app)
        .post('/removeTags')
        .send({ selectedTags, selectedFiles });
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('success');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(__dirname, '../public/image/svg/_tags.json'),
        JSON.stringify(expectedTags)
      );
    });

    test('should return 500 on error', async () => {
      fs.readFileSync.mockImplementation(() => { throw new Error('File read error'); });
      const response = await request(app)
        .post('/removeTags')
        .send({ selectedTags: ['tag'], selectedFiles: ['file'] });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({});
    });
  });

  // Helper function: getNeedleList is internal, so we test it via /findMissing
  describe('GET /findMissing', () => {
    test('should find missing files based on directory content', async () => {
      // Mock for getNeedleList (needleType: "dir")
      path.join.mockReturnValueOnce('/mock/public/images'); // For readdirSync
      fs.readdirSync.mockReturnValueOnce(['apple.png', 'banana.jpg', 'grape.svg']); // Mock 'needle' dir content

      // Mock for haystack
      path.join.mockReturnValueOnce('/mock/public/target'); // For readdirSync
      fs.readdirSync.mockReturnValueOnce(['apple.jpg', 'orange.png']); // Mock 'haystack' dir content

      const response = await request(app)
        .get('/findMissing?needleType=dir&needle=images&haystack=target');
      
      expect(response.status).toBe(200);
      expect(response.body.found).toEqual({
        'apple': '/target/apple.jpg',
      });
      expect(response.body.missing).toEqual(['banana', 'grape']);
    });

    test('should find missing files based on a list', async () => {
      // No mock for getNeedleList needed (needleType: "list")
      // Mock for haystack
      path.join.mockReturnValueOnce('/mock/public/target'); // For readdirSync
      fs.readdirSync.mockReturnValueOnce(['apple.jpg', 'orange.png']); // Mock 'haystack' dir content

      const response = await request(app)
        .get('/findMissing?needleType=list&needle=apple,banana,grape&haystack=target');
      
      expect(response.status).toBe(200);
      expect(response.body.found).toEqual({
        'apple': '/target/apple.jpg',
      });
      expect(response.body.missing).toEqual(['banana', 'grape']);
    });
    
    test('should return empty found/missing if haystack is empty', async () => {
      // Mock for getNeedleList (needleType: "list")
      // Mock for haystack to be empty
      path.join.mockReturnValueOnce('/mock/public/target'); // For readdirSync
      fs.readdirSync.mockReturnValueOnce([]); // Mock 'haystack' dir content

      const response = await request(app)
        .get('/findMissing?needleType=list&needle=apple,banana,grape&haystack=target');
      
      expect(response.status).toBe(200);
      expect(response.body.found).toEqual({});
      expect(response.body.missing).toEqual(['apple', 'banana', 'grape']);
    });
  });

  describe('GET /findAudio', () => {
    test('should return empty string if file query is missing', async () => {
      const response = await request(app).get('/findAudio');
      expect(response.status).toBe(200);
      expect(response.text).toBe('');
    });

    test('should find an existing audio file', async () => {
      fs.existsSync.mockImplementation((p) => p.endsWith('/public/audio/words/testfile.mp3'));
      path.join.mockImplementation((...args) => {
        if (args.includes('../public/audio/words/testfile.mp3')) return '/public/audio/words/testfile.mp3';
        return jest.requireActual('path').join(...args);
      });
      
      const response = await request(app).get('/findAudio?file=testfile');
      expect(response.status).toBe(200);
      expect(response.text).toBe('/audio/words/testfile.mp3');
    });

    test('should return empty string if audio file is not found', async () => {
      fs.existsSync.mockReturnValue(false); // No files exist
      const response = await request(app).get('/findAudio?file=nonexistent');
      expect(response.status).toBe(200);
      expect(response.text).toBe('');
    });
  });
});