import axiosClient from './axiosClient';

export const getShipments  = (params) => axiosClient.get('/shipments', { params });
export const getShipment   = (id)     => axiosClient.get(`/shipments/${id}`);
export const createShipment= (data)   => axiosClient.post('/shipments', data);
export const cancelShipment= (id)     => axiosClient.patch(`/shipments/${id}/cancel`);
export const autoAssign    = (shipment_id) => axiosClient.post('/assign', { shipment_id });
