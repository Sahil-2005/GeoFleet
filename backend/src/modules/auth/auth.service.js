'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/db');
const { jwt: jwtConfig } = require('../../config/env');

/**
 * Register a new user.
 */
const register = async ({ email, password, role, hub_id }) => {
  const saltRounds = 12;
  const password_hash = await bcrypt.hash(password, saltRounds);

  const result = await query(
    `INSERT INTO users (email, password_hash, role, hub_id)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, email, role, hub_id, created_at`,
    [email, password_hash, role, hub_id || null]
  );

  return result.rows[0];
};

/**
 * Login an existing user, returns a signed JWT.
 */
const login = async ({ email, password }) => {
  const result = await query(
    `SELECT user_id, email, password_hash, role, hub_id FROM users WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) throw { status: 401, message: 'Invalid email or password.' };

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw { status: 401, message: 'Invalid email or password.' };

  const payload = { user_id: user.user_id, role: user.role, hub_id: user.hub_id };
  const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

  return {
    token,
    user: { user_id: user.user_id, email: user.email, role: user.role, hub_id: user.hub_id },
  };
};

/**
 * Get current user by user_id.
 */
const getMe = async (user_id) => {
  const result = await query(
    `SELECT user_id, email, role, hub_id, created_at FROM users WHERE user_id = $1`,
    [user_id]
  );
  return result.rows[0] || null;
};

module.exports = { register, login, getMe };
