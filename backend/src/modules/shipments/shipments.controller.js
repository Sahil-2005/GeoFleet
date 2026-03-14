'use strict';
const shipmentsService = require('./shipments.service');
const apiResponse = require('../../utils/apiResponse');

const create = async (req, res) => {
  const shipment = await shipmentsService.create({
    dispatcher_id: req.user.user_id,
    hub_id: req.user.hub_id,
    ...req.body,
  });
  return apiResponse.success(res, shipment, 201);
};

const getAll = async (req, res) => {
  const { status, hub_id } = req.query;
  const shipments = await shipmentsService.getAll({ status, hub_id });
  return apiResponse.success(res, shipments);
};

const getById = async (req, res) => {
  const shipment = await shipmentsService.getById(req.params.shipment_id);
  if (!shipment) return apiResponse.error(res, 'Shipment not found.', 404);
  return apiResponse.success(res, shipment);
};

const cancel = async (req, res) => {
  const shipment = await shipmentsService.cancel(req.params.shipment_id);
  if (!shipment) return apiResponse.error(res, 'Cannot cancel this shipment.', 400);
  return apiResponse.success(res, shipment);
};

module.exports = { create, getAll, getById, cancel };
