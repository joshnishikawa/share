const mysql = require('mysql2/promise');

// Fail fast if database credentials are missing
if (!process.env.host || !process.env.user || !process.env.database) {
  console.error('FATAL: Database environment variables (host, user, database) must be set');
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password || '',
  database: process.env.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
