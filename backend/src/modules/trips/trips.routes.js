'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./trips.controller');
const authenticate = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const asyncWrap = require('../../utils/asyncWrap');

// GET /api/trips  (Admin or Dispatcher)
router.get('/', authenticate, rbac('FLEET_ADMIN', 'DISPATCHER'), asyncWrap(controller.getAll));

// GET /api/trips/my-trip  (Driver)
router.get('/my-trip', authenticate, rbac('DRIVER'), asyncWrap(controller.getMyTrip));

// PATCH /api/trips/:trip_id/start  (Driver)
router.patch('/:trip_id/start', authenticate, rbac('DRIVER'), asyncWrap(controller.startTrip));

// PATCH /api/trips/:trip_id/deliver  (Driver) — fires DB trigger
router.patch('/:trip_id/deliver', authenticate, rbac('DRIVER'), asyncWrap(controller.deliverTrip));

module.exports = router;
