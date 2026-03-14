'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');
const authenticate = require('../../middleware/auth');
const asyncWrap = require('../../utils/asyncWrap');
const { body, validationResult } = require('express-validator');
const apiResponse = require('../../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.error(res, 'Validation failed.', 422, errors.array());
  }
  next();
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['FLEET_ADMIN', 'DISPATCHER', 'DRIVER']),
  ],
  validate,
  asyncWrap(controller.register)
);

// POST /api/auth/login
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  asyncWrap(controller.login)
);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, asyncWrap(controller.getMe));

module.exports = router;
