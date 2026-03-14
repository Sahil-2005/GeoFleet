'use strict';
const { Pool } = require('pg');
const { db } = require('./env');

const pool = new Pool({
  host: db.host,
  port: db.port,
  database: db.database,
  user: db.user,
  password: db.password,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err.message);
  process.exit(1);
});

/**
 * Run a parameterized query.
 * @param {string} text  - SQL query
 * @param {any[]}  params - Query parameters
 */
const query = (text, params) => pool.query(text, params);

/**
 * Get a client from the pool for transactions.
 */
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };
