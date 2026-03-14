'use strict';
const apiResponse = require('../utils/apiResponse');

/**
 * Role-Based Access Control middleware factory.
 * Returns a middleware that allows only the specified roles.
 *
 * Usage: router.get('/route', authenticate, rbac('FLEET_ADMIN', 'DISPATCHER'), handler)
 *
 * @param  {...string} roles - Allowed roles
 * @returns {Function}       - Express middleware
 */
const rbac = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.error(res, 'Not authenticated.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return apiResponse.error(
        res,
        `Forbidden. Required role(s): ${roles.join(', ')}`,
        403
      );
    }

    next();
  };
};

module.exports = rbac;
