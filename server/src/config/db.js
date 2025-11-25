require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

console.log('Configuração do banco:', {
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  host: process.env.HOST_DB,
  port: process.env.PORT_DB,
  database: process.env.DB,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true
});

const pool = new Pool({
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  host: process.env.HOST_DB,
  port: process.env.PORT_DB,
  database: process.env.DB,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true
});


pool.on('error', (err) => {
  console.error('PG pool error:', err.code, err.message);
});

async function query(sql, params = [], attempts = 2) {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    if (err.code === 'EADDRNOTAVAIL' && attempts > 0) {
      await new Promise(r => setTimeout(r, 300)); // backoff curto
      return query(sql, params, attempts - 1);
    }
    throw err;
  }
}

module.exports = { pool, query };