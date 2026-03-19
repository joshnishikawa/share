const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Create database connection pool
const pool = mysql.createPool({
  host: process.env.host || 'localhost',
  user: process.env.user || 'root',
  password: process.env.password || '',
  database: process.env.database || 'EJ',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// GET /api/user - Get current user info (authenticated or not)
router.get('/user', function(req, res) {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        profile_picture: req.user.profile_picture
      }
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
});

// GET /api/sync/canvas/:key - Get canvas data for storage key
router.get('/sync/canvas/:key', requireAuth, async function(req, res) {
  const storageKey = req.params.key;
  const validKeys = ['shapes', 'supplies', 'objects'];

  if (!validKeys.includes(storageKey)) {
    return res.status(400).json({ error: 'Invalid storage key' });
  }

  try {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        'SELECT data, updated_at FROM user_canvas_data WHERE user_id = ? AND storage_key = ?',
        [req.user.id, storageKey]
      );

      if (rows.length > 0) {
        res.json({
          success: true,
          data: JSON.parse(rows[0].data),
          updated_at: rows[0].updated_at
        });
      } else {
        res.json({
          success: true,
          data: null,
          updated_at: null
        });
      }
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching canvas data:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/sync/canvas/:key - Save canvas data for storage key
router.post('/sync/canvas/:key', requireAuth, express.json({ limit: '50mb' }), async function(req, res) {
  const storageKey = req.params.key;
  const validKeys = ['shapes', 'supplies', 'objects'];

  if (!validKeys.includes(storageKey)) {
    return res.status(400).json({ error: 'Invalid storage key' });
  }

  if (!req.body.data) {
    return res.status(400).json({ error: 'Missing data field' });
  }

  try {
    const connection = await pool.getConnection();

    try {
      const dataString = JSON.stringify(req.body.data);
      const now = new Date();

      // Use REPLACE INTO to insert or update
      await connection.execute(
        'REPLACE INTO user_canvas_data (user_id, storage_key, data, updated_at) VALUES (?, ?, ?, ?)',
        [req.user.id, storageKey, dataString, now]
      );

      res.json({
        success: true,
        updated_at: now
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error saving canvas data:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/preferences/:key - Get user preference
router.get('/preferences/:key', requireAuth, async function(req, res) {
  const prefKey = req.params.key;

  try {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        'SELECT pref_value, updated_at FROM user_preferences WHERE user_id = ? AND pref_key = ?',
        [req.user.id, prefKey]
      );

      if (rows.length > 0) {
        res.json({
          success: true,
          value: rows[0].pref_value,
          updated_at: rows[0].updated_at
        });
      } else {
        res.json({
          success: true,
          value: null,
          updated_at: null
        });
      }
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching preference:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/preferences/:key - Save user preference
router.post('/preferences/:key', requireAuth, express.json(), async function(req, res) {
  const prefKey = req.params.key;

  if (!req.body.value) {
    return res.status(400).json({ error: 'Missing value field' });
  }

  try {
    const connection = await pool.getConnection();

    try {
      const now = new Date();

      await connection.execute(
        'REPLACE INTO user_preferences (user_id, pref_key, pref_value, updated_at) VALUES (?, ?, ?, ?)',
        [req.user.id, prefKey, req.body.value, now]
      );

      res.json({
        success: true,
        updated_at: now
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error saving preference:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
