'use strict';
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');
const apiResponse = require('../utils/apiResponse');

/**
 * Verifies the JWT from the Authorization header.
 * Attaches decoded payload to req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return apiResponse.error(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded; // { user_id, role, hub_id, iat, exp }
    next();
  } catch (err) {
    return apiResponse.error(res, 'Invalid or expired token.', 401);
  }
};

module.exports = authenticate;
