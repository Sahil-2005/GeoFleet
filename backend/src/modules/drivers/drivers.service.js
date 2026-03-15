'use strict';
const { query } = require('../../config/db');

const getAll = async () => {
  const result = await query(
    `SELECT d.driver_id, d.status, d.last_updated,
            u.email, u.hub_id,
            v.plate_number, v.capacity_kg, v.vehicle_type,
            ST_Y(d.current_location::geometry) AS lat,
            ST_X(d.current_location::geometry) AS lng,
            t.shipment_id AS active_shipment_id,
            s.status AS shipment_status
     FROM drivers d
     JOIN users u ON d.user_id = u.user_id
     LEFT JOIN vehicles v ON d.vehicle_id = v.vehicle_id
     LEFT JOIN trips t ON d.driver_id = t.driver_id AND t.status = 'IN_TRANSIT'
     LEFT JOIN shipments s ON t.shipment_id = s.shipment_id
     ORDER BY d.last_updated DESC`
  );
  return result.rows;
};

const getById = async (driver_id) => {
  const result = await query(
    `SELECT d.driver_id, d.status, d.last_updated,
            u.user_id, u.email,
            v.vehicle_id, v.plate_number, v.capacity_kg, v.vehicle_type,
            ST_Y(d.current_location::geometry) AS lat,
            ST_X(d.current_location::geometry) AS lng
     FROM drivers d
     JOIN users u ON d.user_id = u.user_id
     LEFT JOIN vehicles v ON d.vehicle_id = v.vehicle_id
     WHERE d.driver_id = $1`,
    [driver_id]
  );
  return result.rows[0] || null;
};

const getByUserId = async (user_id) => {
  const result = await query(
    `SELECT d.driver_id, d.status, d.last_updated,
            v.plate_number, v.capacity_kg, v.vehicle_type,
            ST_Y(d.current_location::geometry) AS lat,
            ST_X(d.current_location::geometry) AS lng
     FROM drivers d
     LEFT JOIN vehicles v ON d.vehicle_id = v.vehicle_id
     WHERE d.user_id = $1`,
    [user_id]
  );
  return result.rows[0] || null;
};

const updateLocation = async (driver_id, { lat, lng }) => {
  const result = await query(
    `UPDATE drivers
     SET current_location = ST_SetSRID(ST_MakePoint($2, $1), 4326),
         last_updated = NOW()
     WHERE driver_id = $3
     RETURNING driver_id, last_updated`,
    [lat, lng, driver_id]
  );
  return result.rows[0];
};

const updateStatus = async (driver_id, status) => {
  const result = await query(
    `UPDATE drivers SET status = $1, last_updated = NOW()
     WHERE driver_id = $2
     RETURNING driver_id, status`,
    [status, driver_id]
  );
  return result.rows[0];
};

module.exports = { getAll, getById, getByUserId, updateLocation, updateStatus };
