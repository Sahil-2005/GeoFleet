'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./shipments.controller');
const authenticate = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const asyncWrap = require('../../utils/asyncWrap');

// POST /api/shipments
router.post('/', authenticate, rbac('DISPATCHER', 'FLEET_ADMIN'), asyncWrap(controller.create));

// GET  /api/shipments
router.get('/', authenticate, rbac('FLEET_ADMIN', 'DISPATCHER'), asyncWrap(controller.getAll));

// GET  /api/shipments/:shipment_id
router.get('/:shipment_id', authenticate, asyncWrap(controller.getById));

// PATCH /api/shipments/:shipment_id/cancel
router.patch('/:shipment_id/cancel', authenticate, rbac('FLEET_ADMIN', 'DISPATCHER'), asyncWrap(controller.cancel));

module.exports = router;
