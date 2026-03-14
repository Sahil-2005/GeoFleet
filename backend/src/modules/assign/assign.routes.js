'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./assign.controller');
const authenticate = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const asyncWrap = require('../../utils/asyncWrap');

// POST /api/assign  (Dispatcher or Admin)
router.post('/', authenticate, rbac('DISPATCHER', 'FLEET_ADMIN'), asyncWrap(controller.autoAssign));

module.exports = router;
