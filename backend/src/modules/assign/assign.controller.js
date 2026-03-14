'use strict';
const assignService = require('./assign.service');
const apiResponse = require('../../utils/apiResponse');

const autoAssign = async (req, res) => {
  const { shipment_id } = req.body;
  if (!shipment_id) return apiResponse.error(res, 'shipment_id is required.', 400);

  const result = await assignService.autoAssign(shipment_id);
  if (!result) {
    return apiResponse.error(res, 'No available driver found within 50km range with sufficient capacity.', 404);
  }
  return apiResponse.success(res, result, 201);
};

module.exports = { autoAssign };
