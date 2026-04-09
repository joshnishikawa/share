const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const pool = require('../config/db.js');

// Rate limiter for sync endpoints (30 requests/minute per user)
const syncLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many sync requests, please try again later' }
});

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (req.isAuthenticated() &&
      req.user &&
      Number.isInteger(req.user.id) &&
      req.user.id > 0) {
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
router.get('/sync/canvas/:key', requireAuth, syncLimiter, async function(req, res) {
  const storageKey = req.params.key;
  const validKeys = ['shapes', 'supplies', 'objects', 'haystack', 'pairs', 'NH', 'LT', 'nolink', 'lps'];

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
router.post('/sync/canvas/:key', requireAuth, syncLimiter, express.json({ limit: '2mb' }), async function(req, res) {
  const storageKey = req.params.key;
  const validKeys = ['shapes', 'supplies', 'objects', 'haystack', 'pairs', 'NH', 'LT', 'nolink', 'lps'];

  if (!validKeys.includes(storageKey)) {
    return res.status(400).json({ error: 'Invalid storage key' });
  }

  if (!req.body.data) {
    return res.status(400).json({ error: 'Missing data field' });
  }

  // Validate data limits for objects (lists, times, lesson plans)
  if (typeof req.body.data === 'object' && !Array.isArray(req.body.data)) {
    const itemCount = Object.keys(req.body.data).length;

    // Set reasonable limits per storage type
    const limits = {
      'NH': 100,       // Max 100 lists
      'LT': 100,       // Max 100 lists
      'nolink': 100,   // Max 100 ad-hoc vocab lists
      'lps': 100,      // Max 100 lesson plans
      'haystack': 52,  // Max 52 letter combinations (Aa-Zz)
      'pairs': 10      // Max 10 pairs combinations
    };

    const maxItems = limits[storageKey] || 100;

    if (itemCount > maxItems) {
      return res.status(400).json({
        error: `Too many items (max ${maxItems} for ${storageKey})`
      });
    }
  }

  // Validate array length for canvas data (shapes, supplies, objects)
  if (Array.isArray(req.body.data) && req.body.data.length > 10) {
    return res.status(400).json({
      error: 'Too many canvas items (max 10)'
    });
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

  // Validate preference key format (alphanumeric, underscore, hyphen only, max 50 chars)
  if (!/^[a-zA-Z0-9_-]{1,50}$/.test(prefKey)) {
    return res.status(400).json({ error: 'Invalid preference key format' });
  }

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

  // Validate preference key format (alphanumeric, underscore, hyphen only, max 50 chars)
  if (!/^[a-zA-Z0-9_-]{1,50}$/.test(prefKey)) {
    return res.status(400).json({ error: 'Invalid preference key format' });
  }

  // Validate value exists and is a string
  if (!req.body.value || typeof req.body.value !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid value field' });
  }

  // Validate value length (max 10KB)
  if (req.body.value.length > 10000) {
    return res.status(400).json({ error: 'Value too large (max 10KB)' });
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
