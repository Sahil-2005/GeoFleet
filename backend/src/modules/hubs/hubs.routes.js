'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./hubs.controller');
const authenticate = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const asyncWrap = require('../../utils/asyncWrap');

// GET /api/hubs
router.get('/', authenticate, asyncWrap(controller.getAll));

// POST /api/hubs  (Admin only)
router.post('/', authenticate, rbac('FLEET_ADMIN'), asyncWrap(controller.create));

// GET /api/hubs/:hub_id/drivers
router.get('/:hub_id/drivers', authenticate, rbac('FLEET_ADMIN', 'DISPATCHER'), asyncWrap(controller.getDriversByHub));

module.exports = router;
