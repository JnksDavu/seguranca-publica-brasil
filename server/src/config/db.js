require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

console.log('Configuração do banco:', {
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  host: process.env.HOST_DB,
  port: process.env.PORT_DB,
  database: process.env.DB,
});

const pool = new Pool({
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  host: process.env.HOST_DB,
  port: parseInt(process.env.PORT_DB, 10),
  database: process.env.DB,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};