import axiosClient from './axiosClient';

export const getTrips   = (params) => axiosClient.get('/trips', { params });
export const getMyTrip  = ()       => axiosClient.get('/trips/my-trip');
export const startTrip  = (id)     => axiosClient.patch(`/trips/${id}/start`);
export const deliverTrip= (id)     => axiosClient.patch(`/trips/${id}/deliver`);
