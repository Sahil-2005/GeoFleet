'use strict';
const driversService = require('./drivers.service');
const apiResponse = require('../../utils/apiResponse');

const getAll = async (req, res) => {
  const drivers = await driversService.getAll();
  return apiResponse.success(res, drivers);
};

const getById = async (req, res) => {
  const driver = await driversService.getById(req.params.driver_id);
  if (!driver) return apiResponse.error(res, 'Driver not found.', 404);
  return apiResponse.success(res, driver);
};

const getByUserId = async (req, res) => {
  const driver = await driversService.getByUserId(req.params.user_id);
  if (!driver) return apiResponse.error(res, 'Driver not found.', 404);
  return apiResponse.success(res, driver);
};

const updateLocation = async (req, res) => {
  const updated = await driversService.updateLocation(req.params.driver_id, req.body);
  return apiResponse.success(res, updated);
};

const updateStatus = async (req, res) => {
  const { status } = req.body;
  const updated = await driversService.updateStatus(req.params.driver_id, status);
  return apiResponse.success(res, updated);
};

module.exports = { getAll, getById, getByUserId, updateLocation, updateStatus };
