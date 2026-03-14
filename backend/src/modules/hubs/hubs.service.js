'use strict';
const { query } = require('../../config/db');

const getAll = async () => {
  const result = await query(
    `SELECT hub_id, name, city,
            ST_Y(location::geometry) AS lat,
            ST_X(location::geometry) AS lng
     FROM hubs ORDER BY name`
  );
  return result.rows;
};

const create = async ({ name, city, lat, lng }) => {
  const result = await query(
    `INSERT INTO hubs (name, city, location)
     VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326))
     RETURNING hub_id, name, city`,
    [name, city, lat, lng]
  );
  return result.rows[0];
};

const getDriversByHub = async (hub_id) => {
  const result = await query(
    `SELECT d.driver_id, u.email, d.status, v.plate_number, v.capacity_kg,
            ST_Y(d.current_location::geometry) AS lat,
            ST_X(d.current_location::geometry) AS lng
     FROM drivers d
     JOIN users u ON d.user_id = u.user_id
     JOIN vehicles v ON d.vehicle_id = v.vehicle_id
     WHERE d.hub_id = $1`,
    [hub_id]
  );
  return result.rows;
};

module.exports = { getAll, create, getDriversByHub };
