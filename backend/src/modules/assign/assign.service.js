'use strict';
const { query, getClient } = require('../../config/db');

/**
 * PostGIS Spatial Auto-Assignment using:
 *  - ST_DWithin  : filter drivers within 50km radius
 *  - <->         : KNN operator to order by nearest first
 *  - FOR UPDATE SKIP LOCKED : prevent double booking in concurrent requests
 */
const autoAssign = async (shipment_id) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Find the nearest available driver with enough capacity
    const driverResult = await client.query(
      `SELECT d.driver_id, d.user_id, v.capacity_kg,
              ROUND(
                (ST_Distance(d.current_location::geography, s.origin::geography) / 1000)::numeric, 2
              ) AS distance_km
       FROM drivers d
       JOIN vehicles v ON d.vehicle_id = v.vehicle_id
       CROSS JOIN (SELECT origin, weight_kg FROM shipments WHERE shipment_id = $1) s
       WHERE d.status = 'AVAILABLE'
         AND v.capacity_kg >= s.weight_kg
         AND ST_DWithin(d.current_location::geography, s.origin::geography, 50000)
       ORDER BY d.current_location <-> (SELECT origin FROM shipments WHERE shipment_id = $1)
       LIMIT 1
       FOR UPDATE OF d SKIP LOCKED`,
      [shipment_id]
    );

    if (driverResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null; // No available driver found
    }

    const { driver_id, distance_km } = driverResult.rows[0];

    // 2. Create the trip
    const tripResult = await client.query(
      `INSERT INTO trips (shipment_id, driver_id)
       VALUES ($1, $2)
       RETURNING trip_id, shipment_id, driver_id, assigned_at`,
      [shipment_id, driver_id]
    );
    const trip = tripResult.rows[0];

    // 3. Update shipment status
    await client.query(
      `UPDATE shipments SET status = 'ASSIGNED', updated_at = NOW() WHERE shipment_id = $1`,
      [shipment_id]
    );

    // 4. Update driver status
    await client.query(
      `UPDATE drivers SET status = 'ON_TRIP', last_updated = NOW() WHERE driver_id = $1`,
      [driver_id]
    );

    await client.query('COMMIT');
    return { ...trip, distance_km };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { autoAssign };
