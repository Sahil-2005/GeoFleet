'use strict';
const tripsService = require('./trips.service');
const apiResponse = require('../../utils/apiResponse');

const getAll = async (req, res) => {
  const { driver_id } = req.query;
  const trips = await tripsService.getAll(driver_id);
  return apiResponse.success(res, trips);
};

const getMyTrip = async (req, res) => {
  const trip = await tripsService.getMyTrip(req.user.user_id);
  if (!trip) return apiResponse.error(res, 'No active trip found.', 404);
  return apiResponse.success(res, trip);
};

const startTrip = async (req, res) => {
  const trip = await tripsService.startTrip(req.params.trip_id);
  if (!trip) return apiResponse.error(res, 'Trip cannot be started (already started or not found).', 400);
  return apiResponse.success(res, trip);
};

const deliverTrip = async (req, res) => {
  const trip = await tripsService.deliverTrip(req.params.trip_id);
  if (!trip) return apiResponse.error(res, 'Trip cannot be delivered (not in transit or not found).', 400);
  return apiResponse.success(res, trip);
};

module.exports = { getAll, getMyTrip, startTrip, deliverTrip };
