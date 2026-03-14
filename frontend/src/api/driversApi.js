import axiosClient from './axiosClient';

export const getDrivers      = ()           => axiosClient.get('/drivers');
export const getDriver       = (id)         => axiosClient.get(`/drivers/${id}`);
export const updateLocation  = (id, data)   => axiosClient.patch(`/drivers/${id}/location`, data);
export const updateStatus    = (id, status) => axiosClient.patch(`/drivers/${id}/status`, { status });
