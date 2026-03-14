'use strict';
const { query, getClient } = require('../../config/db');

const getAll = async (driver_id) => {
  let text = `
    SELECT t.trip_id, t.status, t.assigned_at, t.started_at, t.delivered_at,
           t.driver_id, t.shipment_id,
           s.weight_kg, s.priority, s.notes,
           ST_Y(s.origin::geometry)      AS origin_lat,
           ST_X(s.origin::geometry)      AS origin_lng,
           ST_Y(s.destination::geometry) AS dest_lat,
           ST_X(s.destination::geometry) AS dest_lng
    FROM trips t JOIN shipments s ON t.shipment_id = s.shipment_id
    WHERE 1=1`;
  const params = [];
  if (driver_id) { params.push(driver_id); text += ` AND t.driver_id = $${params.length}`; }
  text += ' ORDER BY t.assigned_at DESC';
  const result = await query(text, params);
  return result.rows;
};

const getMyTrip = async (user_id) => {
  const result = await query(
    `SELECT t.trip_id, t.status, t.assigned_at, t.started_at,
            s.shipment_id, s.weight_kg, s.priority, s.notes,
            ST_Y(s.origin::geometry)      AS origin_lat,
            ST_X(s.origin::geometry)      AS origin_lng,
            ST_Y(s.destination::geometry) AS dest_lat,
            ST_X(s.destination::geometry) AS dest_lng
     FROM trips t
     JOIN shipments s ON t.shipment_id = s.shipment_id
     JOIN drivers d ON t.driver_id = d.driver_id
     WHERE d.user_id = $1 AND t.status IN ('ASSIGNED','IN_TRANSIT')
     ORDER BY t.assigned_at DESC
     LIMIT 1`,
    [user_id]
  );
  return result.rows[0] || null;
};

const startTrip = async (trip_id) => {
  const result = await query(
    `UPDATE trips SET status = 'IN_TRANSIT', started_at = NOW()
     WHERE trip_id = $1 AND status = 'ASSIGNED'
     RETURNING trip_id, status, started_at`,
    [trip_id]
  );
  return result.rows[0] || null;
};

/**
 * Mark trip as DELIVERED — the DB trigger will auto-reset the driver to AVAILABLE.
 */
const deliverTrip = async (trip_id) => {
  const result = await query(
    `UPDATE trips SET status = 'DELIVERED', delivered_at = NOW()
     WHERE trip_id = $1 AND status = 'IN_TRANSIT'
     RETURNING trip_id, status, delivered_at`,
    [trip_id]
  );
  return result.rows[0] || null;
};

module.exports = { getAll, getMyTrip, startTrip, deliverTrip };
