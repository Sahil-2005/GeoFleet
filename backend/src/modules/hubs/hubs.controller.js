'use strict';
const hubsService = require('./hubs.service');
const apiResponse = require('../../utils/apiResponse');

const getAll = async (req, res) => {
  const hubs = await hubsService.getAll();
  return apiResponse.success(res, hubs);
};

const create = async (req, res) => {
  const hub = await hubsService.create(req.body);
  return apiResponse.success(res, hub, 201);
};

const getDriversByHub = async (req, res) => {
  const drivers = await hubsService.getDriversByHub(req.params.hub_id);
  return apiResponse.success(res, drivers);
};

module.exports = { getAll, create, getDriversByHub };
