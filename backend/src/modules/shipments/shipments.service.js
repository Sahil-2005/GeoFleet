'use strict';
const { query } = require('../../config/db');

const create = async ({ dispatcher_id, hub_id, weight_kg, priority, origin, destination, notes }) => {
  const result = await query(
    `INSERT INTO shipments (dispatcher_id, hub_id, weight_kg, priority, origin, destination, notes)
     VALUES ($1, $2, $3, $4,
       ST_SetSRID(ST_MakePoint($6, $5), 4326),
       ST_SetSRID(ST_MakePoint($8, $7), 4326),
       $9)
     RETURNING shipment_id, status, priority, weight_kg, notes, created_at`,
    [
      dispatcher_id, hub_id, weight_kg, priority,
      origin.lat, origin.lng,
      destination.lat, destination.lng,
      notes || null,
    ]
  );
  return result.rows[0];
};

const getAll = async ({ status, hub_id }) => {
  let text = `
    SELECT s.shipment_id, s.status, s.priority, s.weight_kg, s.notes, s.created_at, s.updated_at,
           ST_Y(s.origin::geometry)      AS origin_lat,
           ST_X(s.origin::geometry)      AS origin_lng,
           ST_Y(s.destination::geometry) AS dest_lat,
           ST_X(s.destination::geometry) AS dest_lng
    FROM shipments s
    WHERE 1=1`;
  const params = [];

  if (status) { params.push(status); text += ` AND s.status = $${params.length}`; }
  if (hub_id) { params.push(hub_id); text += ` AND s.hub_id = $${params.length}`; }

  text += ' ORDER BY s.created_at DESC';
  const result = await query(text, params);
  return result.rows;
};

const getById = async (shipment_id) => {
  const result = await query(
    `SELECT s.*,
            ST_Y(s.origin::geometry)      AS origin_lat,
            ST_X(s.origin::geometry)      AS origin_lng,
            ST_Y(s.destination::geometry) AS dest_lat,
            ST_X(s.destination::geometry) AS dest_lng
     FROM shipments s WHERE s.shipment_id = $1`,
    [shipment_id]
  );
  return result.rows[0] || null;
};

const cancel = async (shipment_id) => {
  const result = await query(
    `UPDATE shipments SET status = 'CANCELLED', updated_at = NOW()
     WHERE shipment_id = $1 AND status IN ('PENDING','ASSIGNED')
     RETURNING shipment_id, status`,
    [shipment_id]
  );
  return result.rows[0] || null;
};

module.exports = { create, getAll, getById, cancel };
