const mysql = require('mysql2/promise');

// Pool de Conexões para alta performance e reuso de sockets
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Pokemon@2026',
  database: process.env.DB_NAME || 'pokemon_trading_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
