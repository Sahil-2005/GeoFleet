'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./drivers.controller');
const authenticate = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const asyncWrap = require('../../utils/asyncWrap');

// GET  /api/drivers
router.get('/', authenticate, rbac('FLEET_ADMIN', 'DISPATCHER'), asyncWrap(controller.getAll));

// GET  /api/drivers/:driver_id
router.get('/:driver_id', authenticate, asyncWrap(controller.getById));

// PATCH /api/drivers/:driver_id/location  (Driver updates own location)
router.patch('/:driver_id/location', authenticate, rbac('DRIVER'), asyncWrap(controller.updateLocation));

// PATCH /api/drivers/:driver_id/status  (Driver updates own status)
router.patch('/:driver_id/status', authenticate, rbac('DRIVER'), asyncWrap(controller.updateStatus));

module.exports = router;
